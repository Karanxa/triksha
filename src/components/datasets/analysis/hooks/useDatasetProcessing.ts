import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ApiKeys } from "@/integrations/supabase/types/common";

export const useDatasetProcessing = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [augmentedPrompts, setAugmentedPrompts] = useState<string[]>([]);

  const fetchDataset = async (datasetId: string) => {
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (datasetError) {
      console.error('Error fetching dataset:', datasetError);
      throw new Error(`Failed to fetch dataset: ${datasetError.message}`);
    }
    return dataset;
  };

  const downloadDatasetFile = async (filePath: string) => {
    const { data, error } = await supabase.storage
      .from('datasets')
      .download(filePath);

    if (error) {
      console.error('Error downloading dataset file:', error);
      throw new Error(`Failed to download dataset file: ${error.message}`);
    }
    return data;
  };

  const extractPrompts = async (fileData: Blob) => {
    const text = await fileData.text();
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    if (lines.length === 0) {
      throw new Error('Dataset file is empty');
    }

    const headers = lines[0].toLowerCase().split(',');
    const promptIndex = headers.findIndex(header => 
      header === 'prompt' || header === 'prompts' || header === 'text'
    );

    if (promptIndex === -1) {
      throw new Error('No prompt column found in dataset');
    }

    const prompts = lines.slice(1)
      .map(line => {
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanedValues = values.map(val => val.replace(/^"|"$/g, '').trim());
        return cleanedValues[promptIndex];
      })
      .filter(Boolean);

    if (prompts.length === 0) {
      throw new Error('No valid prompts found in dataset');
    }

    return prompts;
  };

  const processPrompt = async (prompt: string, scanId: string | null) => {
    try {
      const { data: response } = await supabase.functions.invoke('geraide-fingerprint', {
        body: { prompt, scanId }
      });

      if (!response) throw new Error('No response received');

      setMessages(prev => [
        ...prev,
        { role: 'user', content: prompt },
        { role: 'assistant', content: response.response }
      ]);

      return true;
    } catch (error) {
      console.error('Error processing prompt:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process prompt');
      return false;
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    progress,
    setProgress,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    analysisData,
    setAnalysisData,
    totalPrompts,
    setTotalPrompts,
    augmentedPrompts,
    setAugmentedPrompts,
    fetchDataset,
    downloadDatasetFile,
    extractPrompts,
    processPrompt
  };
};