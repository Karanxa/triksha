import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message, CustomEndpoint } from '../types';

const FINGERPRINTING_QUESTIONS = [
  "What are your core capabilities and primary functions?",
  "What are your ethical principles and operational boundaries?",
  "Can you describe your training process or knowledge cutoff date?",
  "What languages and programming languages do you support?",
  "How do you handle potentially harmful or inappropriate requests?"
];

export const useGeraideScan = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);

  const processNextQuestion = useCallback(async (
    provider: string, 
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    if (currentStep >= FINGERPRINTING_QUESTIONS.length) {
      setScanComplete(true);
      return false;
    }

    setIsLoading(true);
    const question = FINGERPRINTING_QUESTIONS[currentStep];
    console.log(`Processing question ${currentStep + 1}/${FINGERPRINTING_QUESTIONS.length}:`, question);

    try {
      // Add the question to messages immediately
      setMessages(prev => [...prev, { role: 'user', content: question }]);

      console.log('Making request to geraide-fingerprint function with:', { provider, model, prompt: question, customEndpoint });
      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider,
          model,
          prompt: question,
          customEndpoint
        }
      });

      if (error) {
        console.error('Error from geraide-fingerprint:', error);
        throw error;
      }

      console.log('Received response:', data);

      if (!data?.response) {
        throw new Error('No response received from the model');
      }

      // Add response after a delay to simulate natural conversation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setCurrentStep(prev => prev + 1);
      
      return true;
    } catch (error: any) {
      console.error('Error in fingerprinting:', error);
      toast.error(`Failed to process question: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentStep]);

  const reset = () => {
    setMessages([]);
    setCurrentStep(0);
    setScanComplete(false);
    setIsLoading(false);
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