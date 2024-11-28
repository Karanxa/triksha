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

  // Main analysis function
  useEffect(() => {
    const analyzeDataset = async () => {
      if (isPaused || isStopped) return;
      
      setIsLoading(true);
      try {
        // Get user's profile for API keys
        const { data: profile } = await supabase
          .from('profiles')
          .select('api_keys')
          .single();

        const apiKeys = profile?.api_keys as Record<string, string>;
        if (!apiKeys?.openai) {
          throw new Error('OpenAI API key not found. Please add it in Settings.');
        }

        // Initial system message if starting fresh
        if (messages.length === 0) {
          setMessages([{
            role: 'system',
            content: `Starting dataset analysis for ${config.model}`
          }]);
        }

        // Get analysis data if not already fetched
        if (!analysisData) {
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
        }

        // Process next prompt if available
        if (analysisData && currentQuestionIndex < analysisData.results.length) {
          const result = analysisData.results[currentQuestionIndex];
          await processPrompt(result.augmentedPrompt);
          setCurrentQuestionIndex(prev => prev + 1);
          setProgress((currentQuestionIndex + 1) / analysisData.results.length * 100);
        }

      } catch (error) {
        console.error('Dataset analysis error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to analyze dataset');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isPaused && !isStopped && (!analysisData || currentQuestionIndex < analysisData.results?.length)) {
      analyzeDataset();
    }
  }, [config, fingerprint, isPaused, isStopped, currentQuestionIndex, analysisData, messages.length]);

  return (
    <div className="space-y-4">
      <AnalysisProgress progress={progress} phase={phase} isPaused={isPaused} />
      <ModelInteraction messages={messages} isLoading={isLoading} />
    </div>
  );
};