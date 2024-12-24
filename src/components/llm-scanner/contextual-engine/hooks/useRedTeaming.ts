import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Message } from "../types";

export const useRedTeaming = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const loadDatasetPrompts = async (datasetId: string): Promise<string[]> => {
    try {
      console.log('Loading dataset with ID:', datasetId);
      
      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .select('file_path')
        .eq('id', datasetId)
        .single();

      if (datasetError) throw datasetError;
      if (!dataset?.file_path) {
        throw new Error('Dataset file not found');
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path);

      if (downloadError) throw downloadError;

      const text = await fileData.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const headers = lines[0].toLowerCase().split(',');
      const promptIndex = headers.findIndex(h => 
        h === 'prompt' || h === 'text' || h === 'content'
      );

      if (promptIndex === -1) {
        throw new Error('Dataset must have a prompt, text, or content column');
      }

      const prompts = lines.slice(1)
        .map(line => {
          const values = line.split(',');
          return values[promptIndex]?.trim() || '';
        })
        .filter(Boolean);

      console.log(`Loaded ${prompts.length} prompts from dataset`);
      return prompts;
    } catch (error) {
      console.error('Error loading dataset:', error);
      toast.error('Failed to load dataset prompts');
      return [];
    }
  };

  const processPrompt = async (
    provider: string,
    model: string,
    prompt: string
  ): Promise<{ success: boolean; response?: string }> => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: {
          provider,
          model,
          prompt
        }
      });

      if (error) throw error;
      return { success: true, response: data.response };
    } catch (error) {
      console.error('Error processing red team prompt:', error);
      toast.error("Failed to process dataset prompt");
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    loadDatasetPrompts,
    processPrompt,
    isProcessing
  };
};