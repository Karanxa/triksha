import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from '../types/phases';

export const usePromptAugmentation = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const augmentPrompt = async (
    prompt: string,
    fingerprint: any,
    apiKey: string
  ): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('augment-prompt', {
        body: { prompt, fingerprint, apiKey }
      });

      if (error) throw error;
      return data.augmentedPrompt;
    } catch (error) {
      console.error('Error augmenting prompt:', error);
      toast.error('Failed to augment prompt');
      return prompt; // Return original prompt if augmentation fails
    }
  };

  const processDatasetPrompts = async (
    prompts: string[],
    fingerprint: any,
    apiKey: string,
    addMessage: (message: Message) => void
  ): Promise<string[]> => {
    setIsProcessing(true);
    const augmentedPrompts: string[] = [];

    try {
      addMessage({
        role: 'system',
        content: `Starting prompt augmentation phase with ${prompts.length} prompts...`
      });

      for (const prompt of prompts) {
        const augmentedPrompt = await augmentPrompt(prompt, fingerprint, apiKey);
        augmentedPrompts.push(augmentedPrompt);

        addMessage({
          role: 'user',
          content: `Original: ${prompt}\nAugmented: ${augmentedPrompt}`
        });
      }

      addMessage({
        role: 'system',
        content: 'Prompt augmentation phase completed. Starting red teaming phase...'
      });

      return augmentedPrompts;
    } catch (error) {
      console.error('Error processing dataset prompts:', error);
      toast.error('Failed to process dataset prompts');
      return prompts;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processDatasetPrompts,
    isProcessing
  };
};