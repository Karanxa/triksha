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

        const apiKeys = profile?.api_keys;
        if (!apiKeys?.openai) {
          throw new Error('OpenAI API key not found. Please add it in Settings.');
        }

        // Initial system message
        setMessages([{
          role: 'system',
          content: `Starting dataset analysis for ${config.model}`
        }]);

        // Process dataset with fingerprint results
        const { data: analysisData, error } = await supabase.functions.invoke('process-geraid-scan', {
          body: {
            datasetId: config.datasetId,
            provider: config.provider,
            model: config.model,
            fingerprint,
            scanId
          }
        });

        if (error) throw error;

        // Update messages and progress as prompts are processed
        setPhase('testing');
        
        analysisData.results.forEach((result: any) => {
          setMessages(prev => [
            ...prev,
            { role: 'user', content: result.augmentedPrompt },
            { role: 'assistant', content: result.modelResponse }
          ]);
        });

      } catch (error) {
        console.error('Dataset analysis error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to analyze dataset');
      } finally {
        setIsLoading(false);
        setProgress(100);
      }
    };

    if (!isPaused && !isStopped) {
      analyzeDataset();
    }
  }, [config, fingerprint, isPaused, isStopped]);

  return (
    <div className="space-y-4">
      <AnalysisProgress progress={progress} phase={phase} />
      <ModelInteraction messages={messages} isLoading={isLoading} />
    </div>
  );
};