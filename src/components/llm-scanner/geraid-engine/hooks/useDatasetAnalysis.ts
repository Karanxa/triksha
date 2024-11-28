import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types';
import { toast } from 'sonner';
import { CustomEndpoint } from '../../types/CustomEndpoint';

interface UseDatasetAnalysisProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
    customEndpoint?: CustomEndpoint;
  };
  fingerprint: any;
}

export const useDatasetAnalysis = ({ config, fingerprint }: UseDatasetAnalysisProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processDataset = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-geraide-scan', {
        body: {
          datasetId: config.datasetId,
          provider: config.provider,
          model: config.model,
          fingerprint,
          customEndpoint: config.customEndpoint
        }
      });

      if (error) throw error;

      // Process each augmented prompt with the model
      const processedResults = [];
      for (const result of data.results) {
        try {
          const { data: modelResponse, error: modelError } = await supabase.functions.invoke('geraide-fingerprint', {
            body: {
              provider: config.provider,
              model: config.model,
              prompt: result.augmentedPrompt,
              customEndpoint: config.customEndpoint
            }
          });

          if (modelError) throw modelError;

          processedResults.push({
            originalPrompt: result.originalPrompt,
            augmentedPrompt: result.augmentedPrompt,
            modelResponse: modelResponse.response
          });

          // Update progress
          const currentProgress = (processedResults.length / data.results.length) * 100;
          setProgress(currentProgress);

          // Update messages
          setMessages(prev => [
            ...prev,
            { role: 'user', content: result.augmentedPrompt },
            { role: 'assistant', content: modelResponse.response }
          ]);

          // Add small delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error processing prompt:', error);
          processedResults.push({
            originalPrompt: result.originalPrompt,
            augmentedPrompt: result.augmentedPrompt,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return processedResults;
    } catch (error) {
      console.error('Dataset analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze dataset');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    progress,
    processDataset
  };
};