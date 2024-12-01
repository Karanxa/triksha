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

const TYPING_DELAY = 1000; // Simulate typing delay

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    currentQuestionIndex: 0,
    fingerprintResults: null,
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

    // Add the question to messages immediately
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: question }]
    }));

    try {
      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider,
          model,
          prompt: question
        }
      });

      if (error) throw error;

      // Add response after a delay to simulate natural conversation
      await new Promise(resolve => setTimeout(resolve, TYPING_DELAY));

      const results: FingerPrintResult = state.fingerprintResults || {
        capabilities: '',
        boundaries: '',
        training: '',
        languages: '',
        safety: ''
      };

      // Map question to corresponding result key
      const questionKey = question.toLowerCase().includes('capabilities') ? 'capabilities'
        : question.toLowerCase().includes('ethical') ? 'boundaries'
        : question.toLowerCase().includes('training') ? 'training'
        : question.toLowerCase().includes('languages') ? 'languages'
        : 'safety';

      results[questionKey] = data.response;

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: data.response }],
        fingerprintResults: results,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        isLoading: false
      }));

      return true;
    } catch (error: any) {
      console.error('Error in fingerprinting:', error);
      toast.error(error.message || "Failed to process question");
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.currentQuestionIndex, state.fingerprintResults]);

  return {
    state,
    processNextQuestion,
    FINGERPRINTING_QUESTIONS
  };
};