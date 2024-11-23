import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message, FingerPrintResult } from "../types";

export const useDatasetAnalysis = (
  config: { provider: string; model: string; datasetId: string },
  fingerprint: FingerPrintResult,
  isStarted: boolean
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isStarted) return;

    const analyzeDataset = async () => {
      setIsLoading(true);
      try {
        // Get dataset content
        const { data: dataset, error: datasetError } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (datasetError) throw datasetError;

        // Add initial message
        setMessages([
          {
            role: 'system',
            content: `Starting dataset analysis for ${dataset.name} using ${config.model}`
          }
        ]);

        // Call the analysis function
        const { data, error } = await supabase.functions.invoke('process-geraide-scan', {
          body: {
            datasetId: config.datasetId,
            provider: config.provider,
            model: config.model,
            fingerprint
          }
        });

        if (error) throw error;

        // Add analysis results to messages
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `Analysis complete. Found ${data.vulnerabilities?.length || 0} potential vulnerabilities.`
          },
          {
            role: 'assistant',
            content: data.summary || 'No issues found in the dataset.'
          }
        ]);

        setIsComplete(true);
      } catch (error) {
        console.error('Dataset analysis error:', error);
        toast.error('Failed to analyze dataset: ' + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    analyzeDataset();
  }, [config, fingerprint, isStarted]);

  return { messages, isLoading, isComplete };
};