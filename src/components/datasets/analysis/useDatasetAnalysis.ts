import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "@/components/llm-scanner/contextual-engine/types";
import { Json } from "@/integrations/supabase/types/common";

export const useDatasetAnalysis = (
  config: { provider: string; model: string; datasetId: string },
  fingerprint: any,
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
        const { data: analysisData, error } = await supabase.functions.invoke('process-contextual-scan', {
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

        // Save results to database
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');

          const messagesJson = messages as unknown as Json;
          const fingerprintJson = fingerprint as unknown as Json;
          const analysisResultsJson = analysisData as unknown as Json;

          const insertData = {
            user_id: user.id,
            provider: config.provider,
            model: config.model,
            messages: messagesJson,
            fingerprint_results: fingerprintJson,
            dataset_analysis_results: analysisResultsJson,
            is_vulnerable: null
          };

          await supabase
            .from('contextual_scans')
            .insert([insertData]);

        } catch (error) {
          console.error('Error saving scan results:', error);
          toast.error('Failed to save scan results');
        }

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
  }, [config, fingerprint, isPaused, startFromProgress, messages]);

  return { 
    messages, 
    isLoading, 
    progress, 
    results 
  };
};