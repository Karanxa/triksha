import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDatasetPrompts = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loadDatasetPrompts = async (datasetId: string): Promise<string[]> => {
    try {
      setIsLoading(true);
      
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

      return prompts;
    } catch (error) {
      console.error('Error loading dataset:', error);
      toast.error('Failed to load dataset prompts');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadDatasetPrompts,
    isLoading
  };
};