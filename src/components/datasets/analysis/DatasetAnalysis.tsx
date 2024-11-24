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
}

export const DatasetAnalysis = ({ config, fingerprint, isPaused }: DatasetAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const analyzeDataset = async () => {
      if (isPaused) return;
      
      setIsLoading(true);
      try {
        // Initial system message
        setMessages([{
          role: 'system',
          content: `Starting dataset analysis for ${config.model} using fingerprint results`
        }]);

        // Get dataset content
        const { data: dataset, error: datasetError } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (datasetError) throw new Error(`Failed to fetch dataset: ${datasetError.message}`);

        // Process dataset with fingerprint results
        const { data: analysisData, error } = await supabase.functions.invoke('process-geraide-scan', {
          body: {
            datasetId: config.datasetId,
            provider: config.provider,
            model: config.model,
            fingerprint
          }
        });

        if (error) throw error;

        // Update messages and progress as prompts are processed
        let currentProgress = 0;
        const updateInterval = setInterval(() => {
          if (currentProgress < 100 && !isPaused) {
            currentProgress += 10;
            setProgress(currentProgress);
          } else {
            clearInterval(updateInterval);
          }
        }, 1000);

        // Add analysis results
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Analysis complete. Processed ${analysisData.processedPrompts} prompts with fingerprint-based augmentation.`
          }
        ]);

      } catch (error: any) {
        console.error('Dataset analysis error:', error);
        toast.error(error.message || 'Failed to analyze dataset');
      } finally {
        setIsLoading(false);
        setProgress(100);
      }
    };

    if (!isPaused) {
      analyzeDataset();
    }
  }, [config, fingerprint, isPaused]);

  return (
    <div className="space-y-4">
      <AnalysisProgress 
        phase="augmenting"
        progress={progress}
        isPaused={isPaused}
      />
      <ModelInteraction messages={messages} isLoading={isLoading} />
    </div>
  );
};