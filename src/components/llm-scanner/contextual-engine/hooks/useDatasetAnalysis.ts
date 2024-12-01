import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message, FingerPrintResult } from "../types";

export const useDatasetAnalysis = (
  config: { provider: string; model: string; datasetId: string },
  fingerprint: FingerPrintResult,
  isPaused: boolean,
  startFromProgress?: number
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(startFromProgress || 0);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const analyzeDataset = async () => {
      if (isPaused) return;
      
      setIsLoading(true);
      try {
        // Initial message if starting fresh
        if (!startFromProgress) {
          setMessages([
            {
              role: 'system',
              content: `Starting dataset analysis for ${config.model} using fingerprint results`
            }
          ]);
        }

        // Process dataset with fingerprint results
        const { data: analysisData, error } = await supabase.functions.invoke('process-geraide-scan', {
          body: {
            datasetId: config.datasetId,
            provider: config.provider,
            model: config.model,
            fingerprint,
            startFromProgress: startFromProgress || 0
          }
        });

        if (error) throw error;

        // Update messages and progress as prompts are processed
        let currentProgress = startFromProgress || 0;
        const updateInterval = setInterval(() => {
          if (!isPaused && currentProgress < 100) {
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

        setResults(analysisData);
      } catch (error) {
        console.error('Dataset analysis error:', error);
        toast.error('Failed to analyze dataset: ' + (error as Error).message);
      } finally {
        if (!isPaused) {
          setIsLoading(false);
          setProgress(100);
        }
      }
    };

    if (!isPaused) {
      analyzeDataset();
    }
  }, [config, fingerprint, isPaused, startFromProgress]);

  return { messages, isLoading, progress, results };
};