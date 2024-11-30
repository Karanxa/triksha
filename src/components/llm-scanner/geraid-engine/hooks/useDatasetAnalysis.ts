import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types';
import { toast } from 'sonner';
import { CustomEndpoint } from '../../types/CustomEndpoint';
import { augmentPrompt } from '../utils/promptAugmentation';

interface UseDatasetAnalysisConfig {
  provider: string;
  model: string;
  datasetId: string;
  customEndpoint?: CustomEndpoint;
}

interface UseDatasetAnalysisResult {
  messages: Message[];
  isLoading: boolean;
  progress: number;
  results: any[];
  startAnalysis: (prompts: string[]) => Promise<void>;
}

export const useDatasetAnalysis = (
  config: UseDatasetAnalysisConfig, 
  fingerprint: any
): UseDatasetAnalysisResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const startAnalysis = async (prompts: string[]) => {
    setIsLoading(true);
    try {
      // First augment all prompts based on fingerprint results
      const augmentedPrompts = await Promise.all(
        prompts.map(async (prompt) => {
          try {
            return await augmentPrompt(prompt, fingerprint);
          } catch (error) {
            console.error('Error augmenting prompt:', error);
            return prompt; // Fall back to original prompt if augmentation fails
          }
        })
      );

      setMessages(prev => [
        ...prev,
        { 
          role: 'system', 
          content: `Successfully augmented ${augmentedPrompts.length} prompts based on model fingerprint analysis.` 
        }
      ]);

      // Process each augmented prompt with the model
      const processedResults = [];
      for (let i = 0; i < augmentedPrompts.length; i++) {
        try {
          const augmentedPrompt = augmentedPrompts[i];
          
          // Add prompt to messages
          setMessages(prev => [
            ...prev,
            { role: 'user', content: augmentedPrompt }
          ]);

          const { data: response, error } = await supabase.functions.invoke('geraide-fingerprint', {
            body: {
              provider: config.provider,
              model: config.model,
              prompt: augmentedPrompt,
              customEndpoint: config.customEndpoint
            }
          });

          if (error) throw error;

          // Add model response to messages
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: response.response }
          ]);

          processedResults.push({
            originalPrompt: prompts[i],
            augmentedPrompt,
            modelResponse: response.response
          });

          // Update progress
          const currentProgress = ((i + 1) / augmentedPrompts.length) * 100;
          setProgress(currentProgress);

          // Add small delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error processing prompt:', error);
          setMessages(prev => [
            ...prev,
            { 
              role: 'system', 
              content: `Error processing prompt: ${error instanceof Error ? error.message : 'Unknown error'}` 
            }
          ]);
        }
      }

      setResults(processedResults);

      // Save augmented dataset
      const csvContent = 'original_prompt,augmented_prompt\n' + 
        processedResults.map(r => 
          `"${r.originalPrompt.replace(/"/g, '""')}","${r.augmentedPrompt.replace(/"/g, '""')}"`
        ).join('\n');

      const file = new Blob([csvContent], { type: 'text/csv' });
      const filePath = `${config.datasetId}/augmented_${Date.now()}.csv`;

      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setMessages(prev => [
        ...prev,
        { 
          role: 'system', 
          content: 'Analysis complete. Augmented dataset has been saved.' 
        }
      ]);

    } catch (error) {
      console.error('Dataset analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze dataset');
      setMessages(prev => [
        ...prev,
        { 
          role: 'system', 
          content: `Error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    progress,
    results,
    startAnalysis
  };
};