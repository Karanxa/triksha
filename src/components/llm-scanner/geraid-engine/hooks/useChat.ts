import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message, ChatState, ProcessQuestionResult } from '../types';
import { FINGERPRINTING_QUESTIONS } from '../constants/questions';
import { Json } from '@/integrations/supabase/types';

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
    if (state.isLoading) {
      console.log('Already processing a question, skipping...');
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const question = FINGERPRINTING_QUESTIONS[state.currentQuestionIndex];
      console.log('Processing question:', question);

      // Add the question to messages immediately
      const newMessage: Message = { role: 'user', content: question };
      const updatedMessages = [...state.messages, newMessage];
      setState(prev => ({ ...prev, messages: updatedMessages }));

      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider,
          model,
          prompt: question,
          scanId
        }
      });

      if (error) throw error;
      if (!data?.response) throw new Error('No response received from the model');

      console.log('Received model response:', data.response);

      const assistantMessage: Message = { role: 'assistant', content: data.response };
      const finalMessages = [...updatedMessages, assistantMessage];

      // Store or update conversation in database
      if (!scanId) {
        const { data: scanData, error: scanError } = await supabase
          .from('contextual_scans')
          .insert({
            provider,
            model,
            messages: finalMessages as unknown as Json,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (scanError) throw scanError;

        // Update fingerprint results based on the current question
        const updatedFingerprint = {
          ...state.fingerprintResults,
          [Object.keys(FINGERPRINTING_QUESTIONS)[state.currentQuestionIndex]]: data.response
        };
        
        setState(prev => ({ 
          ...prev, 
          messages: finalMessages,
          scanId: scanData.id,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          fingerprintResults: updatedFingerprint,
          isLoading: false 
        }));
        
        return { success: true, scanId: scanData.id };
      } else {
        const { error: updateError } = await supabase
          .from('contextual_scans')
          .update({
            messages: finalMessages as unknown as Json,
          })
          .eq('id', scanId);

        if (updateError) throw updateError;

        // Update fingerprint results based on the current question
        const updatedFingerprint = {
          ...state.fingerprintResults,
          [Object.keys(FINGERPRINTING_QUESTIONS)[state.currentQuestionIndex]]: data.response
        };
        
        setState(prev => ({
          ...prev,
          messages: finalMessages,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          fingerprintResults: updatedFingerprint,
          isLoading: false
        }));
        
        return { success: true, scanId };
      }
    } catch (error) {
      console.error('Error in fingerprinting:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
      return false;
    }
  }, [state.messages, state.currentQuestionIndex, state.fingerprintResults]);

  return {
    state,
    processNextQuestion,
    FINGERPRINTING_QUESTIONS
  };
};