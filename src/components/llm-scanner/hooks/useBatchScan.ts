import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBatchScan = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const loadDatasetPrompts = async (datasetId: string): Promise<string[]> => {
    try {
      console.log('Loading prompts for dataset:', datasetId);
      
      // Get dataset details
      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .select('file_path')
        .eq('id', datasetId)
        .single();

      if (datasetError) throw datasetError;
      if (!dataset?.file_path) {
        throw new Error('Dataset file not found');
      }

      // Download dataset file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path);

      if (downloadError) throw downloadError;

      // Process CSV content
      const text = await fileData.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      
      if (lines.length === 0) {
        throw new Error('Dataset is empty');
      }

      // Find prompt column
      const headers = lines[0].toLowerCase().split(',');
      const promptIndex = headers.findIndex(h => 
        h === 'prompt' || h === 'text' || h === 'content'
      );

      if (promptIndex === -1) {
        throw new Error('Dataset must have a prompt, text, or content column');
      }

      // Extract prompts
      const prompts = lines.slice(1)
        .map(line => {
          const values = line.split(',');
          return values[promptIndex]?.trim() || '';
        })
        .filter(Boolean);

      console.log(`Loaded ${prompts.length} prompts from dataset`);
      return prompts;
    } catch (error) {
      console.error('Error loading dataset prompts:', error);
      throw error;
    }
  };

  const startBatchScan = async (
    datasetId: string,
    provider: string,
    category: string,
    onStart: (prompts: string[]) => Promise<void>
  ) => {
    try {
      setIsProcessing(true);
      console.log('Starting batch scan for dataset:', datasetId);

      const prompts = await loadDatasetPrompts(datasetId);
      
      if (prompts.length === 0) {
        throw new Error('No valid prompts found in dataset');
      }

      await onStart(prompts);
      toast.success(`Started batch scan with ${prompts.length} prompts`);
    } catch (error) {
      console.error('Batch scan error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start batch scan');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    startBatchScan,
    isProcessing
  };
};