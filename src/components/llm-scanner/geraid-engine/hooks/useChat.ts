import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatState } from '../types/chat';
import { FingerPrintResult } from '../types';

const FINGERPRINTING_QUESTIONS = [
  "What are your core capabilities and primary functions?",
  "What are your ethical principles and operational boundaries?",
  "Can you describe your training process or knowledge cutoff date?",
  "What languages and programming languages do you support?",
  "How do you handle potentially harmful or inappropriate requests?"
];

const TYPING_DELAY = 1000;

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    currentQuestionIndex: 0,
    fingerprintResults: null,
    scanId: null
  });

  const processNextQuestion = useCallback(async (provider: string, model: string) => {
    if (state.currentQuestionIndex >= FINGERPRINTING_QUESTIONS.length) {
      return false;
    }

    setState(prev => ({
      ...prev,
      isLoading: true
    }));

    const question = FINGERPRINTING_QUESTIONS[state.currentQuestionIndex];

    try {
      // Add the question to messages immediately
      const newMessage = { role: 'user', content: question };
      const updatedMessages = [...state.messages, newMessage];
      setState(prev => ({ ...prev, messages: updatedMessages }));

      // Get response from model
      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider,
          model,
          prompt: question
        }
      });

      if (error) throw error;

      if (!data?.response) {
        throw new Error('No response received from the model');
      }

      // Add response after a delay to simulate natural conversation
      await new Promise(resolve => setTimeout(resolve, TYPING_DELAY));
      
      const assistantMessage = { role: 'assistant', content: data.response };
      const finalMessages = [...updatedMessages, assistantMessage];

      // Store conversation in database if we haven't yet
      if (!state.scanId) {
        const { data: scanData, error: scanError } = await supabase
          .from('geraide_scans')
          .insert({
            provider,
            model,
            messages: finalMessages,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (scanError) throw scanError;
        setState(prev => ({ 
          ...prev, 
          messages: finalMessages,
          scanId: scanData.id,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          isLoading: false 
        }));
      } else {
        // Update existing scan
        const { error: updateError } = await supabase
          .from('geraide_scans')
          .update({
            messages: finalMessages,
          })
          .eq('id', state.scanId);

        if (updateError) throw updateError;
        setState(prev => ({
          ...prev,
          messages: finalMessages,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          isLoading: false
        }));
      }

      return true;
    } catch (error: any) {
      console.error('Error in fingerprinting:', error);
      toast.error(`Error: ${error.message}`);
      const errorMessage = { role: 'assistant', content: `Error: ${error.message}` };
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMessage],
        isLoading: false 
      }));
      return false;
    }
  }, [state]);

  return {
    state,
    processNextQuestion,
    FINGERPRINTING_QUESTIONS
  };
};