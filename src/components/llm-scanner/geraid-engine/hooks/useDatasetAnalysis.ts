import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message, FingerPrintResult } from "../types";

export const useDatasetAnalysis = (
  config: { provider: string; model: string; datasetId: string },
  fingerprint: FingerPrintResult
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const startAnalysis = async (prompts: string[]) => {
    setIsLoading(true);
    try {
      // Initial message
      setMessages([
        {
          role: 'system',
          content: `Starting dataset analysis for ${config.model} using fingerprint results`
        }
      ]);

      // Process dataset with fingerprint results
      const { data: analysisData, error } = await supabase.functions.invoke('process-geraide-scan', {
        body: {
          datasetId: config.datasetId,
          provider: config.provider,
          model: config.model,
          fingerprint,
          prompts
        }
      });

      if (error) throw error;

      // Update messages and progress as prompts are processed
      let currentProgress = 0;
      const updateInterval = setInterval(() => {
        if (currentProgress < 100) {
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
          content: `Analysis complete. Processed ${prompts.length} prompts with fingerprint-based augmentation.`
        }
      ]);

      setResults(analysisData);
    } catch (error) {
      console.error('Dataset analysis error:', error);
      toast.error('Failed to analyze dataset: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  return { messages, isLoading, progress, results, startAnalysis };
};