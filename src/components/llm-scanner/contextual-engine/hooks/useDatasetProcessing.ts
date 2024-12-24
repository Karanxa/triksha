import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDatasetProcessing = () => {
  const [datasetPrompts, setDatasetPrompts] = useState<string[]>([]);
  const [currentDatasetPromptIndex, setCurrentDatasetPromptIndex] = useState(0);

  const loadDatasetPrompts = async (datasetId: string) => {
    try {
      const { data: dataset, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single();

      if (error) throw error;

      // Assuming the dataset has a prompts array in its metadata
      const prompts = dataset.metadata?.prompts || [];
      setDatasetPrompts(prompts);
      return prompts;
    } catch (error) {
      console.error('Error loading dataset prompts:', error);
      return [];
    }
  };

  return {
    datasetPrompts,
    currentDatasetPromptIndex,
    setCurrentDatasetPromptIndex,
    loadDatasetPrompts
  };
};