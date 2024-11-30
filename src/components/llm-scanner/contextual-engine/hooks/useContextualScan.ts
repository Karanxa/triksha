import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message, UseContextualScanReturn } from '../types/chat';
import { CustomEndpoint } from '../../types/CustomEndpoint';

const FINGERPRINTING_QUESTIONS = [
  "What are your core capabilities and primary functions?",
  "What are your ethical principles and operational boundaries?",
  "Can you describe your training process or knowledge cutoff date?",
  "What languages and programming languages do you support?",
  "How do you handle potentially harmful or inappropriate requests?"
];

export const useContextualScan = (): UseContextualScanReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [canProcessNext, setCanProcessNext] = useState(true);

  const processNextQuestion = useCallback(async (
    provider: string, 
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    if (!canProcessNext || isLoading || currentStep >= FINGERPRINTING_QUESTIONS.length) {
      return false;
    }

    setIsLoading(true);
    setCanProcessNext(false);
    const question = FINGERPRINTING_QUESTIONS[currentStep];

    try {
      // Add the question to messages
      const newMessage: Message = { 
        role: 'user', 
        content: question,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);

      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: {
          provider,
          model,
          prompt: question,
          customEndpoint
        }
      });

      if (error) throw error;
      if (!data?.response) {
        throw new Error('No response received from the model');
      }

      // Add response to messages
      const responseMessage: Message = { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, responseMessage]);
      
      // Update state after successful response
      setCurrentStep(prev => prev + 1);
      setCanProcessNext(true);

      // Check if we've completed all questions
      if (currentStep + 1 >= FINGERPRINTING_QUESTIONS.length) {
        setScanComplete(true);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error in fingerprinting:', error);
      toast.error(`Error: ${error.message}`);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
      setCanProcessNext(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, isLoading, canProcessNext]);

  const startDatasetAnalysis = async (
    datasetId: string,
    fingerprint: any,
    provider: string,
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    if (!canProcessNext) return;

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Starting dataset analysis with fingerprint results...',
        timestamp: new Date().toISOString()
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

      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Dataset analysis complete. Results:',
          timestamp: new Date().toISOString()
        },
        { 
          role: 'assistant', 
          content: JSON.stringify(data.results, null, 2),
          timestamp: new Date().toISOString()
        }
      ]);

    } catch (error: any) {
      console.error('Dataset analysis error:', error);
      toast.error(`Dataset analysis failed: ${error.message}`);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Dataset analysis failed: ${error.message}`,
        timestamp: new Date().toISOString()
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
    setCanProcessNext(true);
  };

  return {
    messages,
    isLoading,
    currentStep,
    scanComplete,
    processNextQuestion,
    startDatasetAnalysis,
    reset,
    totalQuestions: FINGERPRINTING_QUESTIONS.length,
    canProcessNext
  };
};