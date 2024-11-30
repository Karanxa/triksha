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
  const [lastResponseReceived, setLastResponseReceived] = useState(true);

  const processNextQuestion = useCallback(async (
    provider: string, 
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    // Don't proceed if we're still waiting for the last response
    if (!lastResponseReceived || isLoading || currentStep >= FINGERPRINTING_QUESTIONS.length) {
      console.log('Cannot process next question:', { lastResponseReceived, isLoading, currentStep });
      return false;
    }

    setIsLoading(true);
    setLastResponseReceived(false);
    const question = FINGERPRINTING_QUESTIONS[currentStep];

    try {
      console.log('Processing question:', question);
      
      // Add the question to messages
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: question,
        timestamp: new Date().toISOString()
      }]);

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

      console.log('Received response:', data.response);

      // Add response to messages and update state
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date().toISOString()
      }]);

      // Mark that we've received the response and can proceed
      setLastResponseReceived(true);
      setCurrentStep(prev => prev + 1);

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
      setLastResponseReceived(true); // Reset the flag even on error
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, isLoading, lastResponseReceived]);

  const startDatasetAnalysis = async (
    datasetId: string,
    fingerprint: any,
    provider: string,
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    if (!lastResponseReceived) {
      toast.error('Please wait for the current response before starting dataset analysis');
      return;
    }

    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: 'Starting dataset analysis with fingerprint results...',
        timestamp: new Date().toISOString()
      }]);

      console.log('Starting dataset analysis:', {
        datasetId,
        provider,
        model,
        fingerprint
      });

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

      console.log('Dataset analysis complete:', data);

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
    setLastResponseReceived(true);
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
    canProcessNext: lastResponseReceived && !isLoading
  };
};
