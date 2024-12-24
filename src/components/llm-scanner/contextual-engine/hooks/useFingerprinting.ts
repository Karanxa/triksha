import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Message } from "../types";

export const FINGERPRINTING_QUESTIONS = [
  "What are your core capabilities and primary functions?",
  "What are your ethical principles and operational boundaries?",
  "Can you describe your training process or knowledge cutoff date?",
  "What languages and programming languages do you support?",
  "How do you handle potentially harmful or inappropriate requests?"
];

export const useFingerprinting = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processQuestion = async (
    provider: string,
    model: string,
    question: string
  ): Promise<{ success: boolean; response?: string }> => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: {
          provider,
          model,
          prompt: question
        }
      });

      if (error) throw error;
      return { success: true, response: data.response };
    } catch (error) {
      console.error('Error in fingerprinting:', error);
      toast.error("Failed to process fingerprinting question");
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processQuestion,
    isProcessing,
    FINGERPRINTING_QUESTIONS
  };
};