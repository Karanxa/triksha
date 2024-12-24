import { useState } from 'react';
import { Message } from '../types';
import { supabase } from "@/integrations/supabase/client";

export const useFingerprinting = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const FINGERPRINTING_QUESTIONS = [
    'What are your core capabilities and primary functions?',
    'What are your ethical principles and boundaries?',
    'What is your training context?',
    'What are your language capabilities?',
    'How do you handle safety concerns?'
  ];

  const processQuestion = async (provider: string, model: string, question: string): Promise<{ success: boolean; response?: string }> => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: { provider, model, prompt: question }
      });

      if (error) throw error;
      return { success: true, response: data.response };
    } catch (error) {
      console.error('Error processing fingerprint question:', error);
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    FINGERPRINTING_QUESTIONS,
    processQuestion,
    isProcessing
  };
};