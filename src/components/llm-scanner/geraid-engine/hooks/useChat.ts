import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Message, ChatState, ProcessQuestionResult } from '../types';
import { FINGERPRINTING_QUESTIONS } from '../constants/questions';

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    currentQuestionIndex: 0,
    fingerprintResults: null,
    scanId: null
  });

  const processNextQuestion = useCallback(async (
    provider: string, 
    model: string,
    scanId: string | null
  ): Promise<ProcessQuestionResult | false> => {
    if (state.isLoading || state.currentQuestionIndex >= FINGERPRINTING_QUESTIONS.length) {
      console.log('Skipping question - loading or completed:', { 
        isLoading: state.isLoading, 
        currentIndex: state.currentQuestionIndex 
      });
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const question = FINGERPRINTING_QUESTIONS[state.currentQuestionIndex];
      console.log('Processing question:', question, 'Index:', state.currentQuestionIndex);

      // Add the question to messages
      const newMessage: Message = { role: 'user', content: question };
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, newMessage]
      }));

      console.log('Making request to geraide-fingerprint function');
      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider,
          model,
          prompt: question,
          scanId
        }
      });

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      console.log('Received response from function:', data);
      if (!data?.response) {
        console.error('No response received from the model');
        throw new Error('No response received from the model');
      }

      const assistantMessage: Message = { role: 'assistant', content: data.response };
      
      // Update state with the new message and increment question index
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        fingerprintResults: {
          ...prev.fingerprintResults,
          [Object.keys(FINGERPRINTING_QUESTIONS)[prev.currentQuestionIndex]]: data.response
        },
        isLoading: false,
        scanId: scanId || prev.scanId
      }));

      return { success: true, scanId: scanId || state.scanId };
    } catch (error) {
      console.error('Error in fingerprinting:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.currentQuestionIndex, state.isLoading, state.messages, state.fingerprintResults, state.scanId]);

  return {
    state,
    processNextQuestion
  };
};