import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message } from '../types';
import { CustomEndpoint } from '../../types/CustomEndpoint';

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
  const [processedQuestions, setProcessedQuestions] = useState<Set<number>>(new Set());

  const processNextQuestion = useCallback(async (
    provider: string, 
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    console.log('processNextQuestion called:', { currentStep, processedQuestions: Array.from(processedQuestions) });
    
    if (currentStep >= FINGERPRINTING_QUESTIONS.length) {
      console.log('All questions processed, scan complete');
      setScanComplete(true);
      return false;
    }

    // Check if we've already processed this question
    if (processedQuestions.has(currentStep)) {
      console.log('Question already processed, skipping:', currentStep);
      setCurrentStep(prev => prev + 1);
      return true;
    }

    setIsLoading(true);
    const question = FINGERPRINTING_QUESTIONS[currentStep];
    console.log('Processing question:', { currentStep, question });

    try {
      // Add the question to messages
      setMessages(prev => [...prev, { role: 'user', content: question }]);

      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: {
          provider,
          model,
          prompt: question,
          customEndpoint
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) throw error;

      if (!data?.response) {
        throw new Error('No response received from the model');
      }

      // Add model's response after a delay to simulate natural conversation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Mark this question as processed and move to the next one
      setProcessedQuestions(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
      
      return true;
    } catch (error: any) {
      console.error('Error in fingerprinting:', error);
      toast.error(`Error: ${error.message}`);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, processedQuestions]);

  const startDatasetAnalysis = async (
    datasetId: string,
    fingerprint: any,
    provider: string,
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Starting dataset analysis with fingerprint results...' 
      }]);

      const { data, error } = await supabase.functions.invoke('process-contextual-scan', {
        body: {
          datasetId,
          provider,
          model,
          fingerprint,
          customEndpoint
        }
      });

      if (error) throw error;

      // Add analysis results to chat
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Dataset analysis complete. Results:' },
        { role: 'assistant', content: JSON.stringify(data.results, null, 2) }
      ]);

    } catch (error: any) {
      console.error('Dataset analysis error:', error);
      toast.error(`Dataset analysis failed: ${error.message}`);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Dataset analysis failed: ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setCurrentStep(0);
    setScanComplete(false);
    setIsLoading(false);
    setProcessedQuestions(new Set());
  };

  return {
    messages,
    isLoading,
    currentStep,
    scanComplete,
    processNextQuestion,
    startDatasetAnalysis,
    reset,
    totalQuestions: FINGERPRINTING_QUESTIONS.length
  };
};