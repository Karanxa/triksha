import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "../types";
import { CustomEndpoint } from "../../types/CustomEndpoint";

const FINGERPRINTING_QUESTIONS = [
  "What are your core capabilities and primary functions?",
  "What are your ethical principles and operational boundaries?",
  "Can you describe your training process or knowledge cutoff date?",
  "What languages and programming languages do you support?",
  "How do you handle potentially harmful or inappropriate requests?"
];

export const useContextualScan = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [processingQuestion, setProcessingQuestion] = useState(false);

  const processNextQuestion = useCallback(async (
    provider: string, 
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    if (currentStep >= FINGERPRINTING_QUESTIONS.length || processingQuestion) {
      setScanComplete(true);
      return false;
    }

    setProcessingQuestion(true);
    setIsLoading(true);
    const question = FINGERPRINTING_QUESTIONS[currentStep];

    try {
      // Add user question with timestamp
      const userMessage: Message = { 
        role: 'user', 
        content: question,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      console.log('Sending request to contextual-fingerprint:', {
        provider,
        model,
        prompt: question,
        customEndpoint
      });

      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: {
          provider,
          model,
          prompt: question,
          customEndpoint
        }
      });

      if (error) {
        console.error('Error from contextual-fingerprint:', error);
        throw error;
      }

      if (!data?.response) {
        console.error('No response received:', data);
        throw new Error('No response received from the model');
      }

      // Add model response with timestamp
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentStep(prev => prev + 1);
      return true;
    } catch (error: any) {
      console.error('Error in fingerprinting:', error);
      toast.error(`Error: ${error.message}`);
      
      const errorMessage: Message = { 
        role: 'system', 
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      return false;
    } finally {
      setIsLoading(false);
      setProcessingQuestion(false);
    }
  }, [currentStep, processingQuestion]);

  const reset = () => {
    setMessages([]);
    setCurrentStep(0);
    setScanComplete(false);
    setIsLoading(false);
    setProcessingQuestion(false);
  };

  return {
    messages,
    isLoading,
    currentStep,
    scanComplete,
    processNextQuestion,
    reset,
    totalQuestions: FINGERPRINTING_QUESTIONS.length
  };
};