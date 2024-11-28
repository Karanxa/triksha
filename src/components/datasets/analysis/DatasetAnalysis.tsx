import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { AnalysisProgress } from "./AnalysisProgress";
import { ModelInteraction } from "./ModelInteraction";
import { FingerPrintResult } from "@/components/llm-scanner/geraid-engine/types";

interface DatasetAnalysisProps {
  config: {
    datasetId: string;
    provider: string;
    model: string;
  };
  fingerprint: FingerPrintResult;
  isPaused: boolean;
  isStopped: boolean;
  scanId: string | null;
}

export const DatasetAnalysis = ({ 
  config, 
  fingerprint, 
  isPaused,
  isStopped,
  scanId 
}: DatasetAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'augmenting' | 'testing'>('augmenting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Process a single prompt
  const processPrompt = async (prompt: string) => {
    try {
      const { data: response } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider: config.provider,
          model: config.model,
          prompt,
          scanId
        }
      });

      if (!response) throw new Error('No response received');

      setMessages(prev => [
        ...prev,
        { role: 'user', content: prompt },
        { role: 'assistant', content: response.response }
      ]);

      return response;
    } catch (error) {
      console.error('Error processing prompt:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process prompt');
      return null;
    }
  };

  // Fetch initial analysis data
  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!analysisData && !isPaused && !isStopped) {
        try {
          setIsLoading(true);
          
          // Get user's profile for API keys
          const { data: profile } = await supabase
            .from('profiles')
            .select('api_keys')
            .single();

          const apiKeys = profile?.api_keys as Record<string, string>;
          if (!apiKeys?.openai) {
            throw new Error('OpenAI API key not found. Please add it in Settings.');
          }

          // Initial system message
          setMessages([{
            role: 'system',
            content: `Starting dataset analysis for ${config.model}`
          }]);

          const { data, error } = await supabase.functions.invoke('process-geraid-scan', {
            body: {
              datasetId: config.datasetId,
              provider: config.provider,
              model: config.model,
              fingerprint,
              scanId
            }
          });

          if (error) throw error;
          setAnalysisData(data);
          setPhase('testing');
        } catch (error) {
          console.error('Dataset analysis error:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to analyze dataset');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAnalysisData();
  }, [config, fingerprint, isPaused, isStopped, scanId, analysisData]);

  // Process prompts sequentially
  useEffect(() => {
    let isMounted = true;

    const processNextPrompt = async () => {
      if (
        !isLoading && 
        !isPaused && 
        !isStopped && 
        analysisData?.results && 
        currentQuestionIndex < analysisData.results.length
      ) {
        setIsLoading(true);
        const result = analysisData.results[currentQuestionIndex];
        const response = await processPrompt(result.augmentedPrompt);
        
        if (response && isMounted) {
          setCurrentQuestionIndex(prev => prev + 1);
          setProgress((currentQuestionIndex + 1) / analysisData.results.length * 100);
          setIsLoading(false);
        }
      }
    };

    processNextPrompt();

    return () => {
      isMounted = false;
    };
  }, [currentQuestionIndex, analysisData, isPaused, isStopped]);

  return (
    <div className="space-y-4">
      <AnalysisProgress progress={progress} phase={phase} isPaused={isPaused} />
      <ModelInteraction messages={messages} isLoading={isLoading} />
    </div>
  );
};