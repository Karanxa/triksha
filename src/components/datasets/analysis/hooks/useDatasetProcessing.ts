import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { toast } from "sonner";

interface ProfileApiKeys {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  huggingface?: string;
  github?: string;
  ollama_endpoint?: string;
}

export const useDatasetProcessing = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [augmentedPrompts, setAugmentedPrompts] = useState<string[]>([]);

  const processPrompt = async (prompt: string, scanId: string | null): Promise<boolean> => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    processPrompt
  };
};