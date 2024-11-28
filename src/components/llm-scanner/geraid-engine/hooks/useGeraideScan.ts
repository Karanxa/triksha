import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message } from '../types';
import { CustomEndpoint } from '../../types/CustomEndpoint';
import { Json } from '@/integrations/supabase/types/common';
import { FINGERPRINTING_QUESTIONS } from '../constants/questions';
import { ScanState } from '../types/scan';
import { processDatasetAnalysis } from './useDatasetAnalysis';

export const useGeraideScan = () => {
  const [state, setState] = useState<ScanState>({
    messages: [],
    isLoading: false,
    currentStep: 0,
    scanComplete: false,
    scanId: null
  });

  const processNextQuestion = useCallback(async (
    provider: string, 
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    if (currentStep >= FINGERPRINTING_QUESTIONS.length) {
      setScanComplete(true);
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    const question = FINGERPRINTING_QUESTIONS[state.currentStep];

    try {
      // Add the question to messages immediately
      const newMessage: Message = { role: 'user', content: question };
      const updatedMessages = [...state.messages, newMessage];
      setState(prev => ({ ...prev, messages: updatedMessages }));

      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
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

      // Add response after a delay to simulate natural conversation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantMessage: Message = { role: 'assistant', content: data.response };
      const finalMessages = [...updatedMessages, assistantMessage];

      // Store conversation in database if we haven't yet
      if (!state.scanId) {
        const { data: scanData, error: scanError } = await supabase
          .from('geraide_scans')
          .insert({
            provider,
            model,
            messages: finalMessages as unknown as Json,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (scanError) throw scanError;
        setState(prev => ({ 
          ...prev, 
          messages: finalMessages,
          scanId: scanData.id,
          currentStep: prev.currentStep + 1,
          isLoading: false 
        }));
      } else {
        // Update existing scan
        const { error: updateError } = await supabase
          .from('geraide_scans')
          .update({
            messages: finalMessages as unknown as Json,
          })
          .eq('id', state.scanId);

        if (updateError) throw updateError;
        setState(prev => ({
          ...prev,
          messages: finalMessages,
          currentStep: prev.currentStep + 1,
          isLoading: false
        }));
      }

      return true;
    } catch (error: any) {
      console.error('Error in fingerprinting:', error);
      toast.error(`Error: ${error.message}`);
      const errorMessage: Message = { role: 'assistant', content: `Error: ${error.message}` };
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMessage],
        isLoading: false 
      }));
      return false;
    }
  }, [state]);

  const startDatasetAnalysis = async (
    datasetId: string,
    fingerprint: any,
    provider: string,
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const systemMessage: Message = { 
        role: 'system', 
        content: 'Starting dataset analysis with fingerprint results...' 
      };
      setState(prev => ({ ...prev, messages: [...prev.messages, systemMessage] }));

      const results = await processDatasetAnalysis({
        datasetId,
        provider,
        model,
        fingerprint,
        customEndpoint,
        scanId: state.scanId,
        supabase
      });

      // Add completion message
      const completionMessage: Message = { 
        role: 'system', 
        content: `Analysis complete. Processed ${results.length} prompts with fingerprint-based augmentation.` 
      };
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, completionMessage],
        isLoading: false 
      }));

    } catch (error: any) {
      console.error('Dataset analysis error:', error);
      toast.error(`Dataset analysis failed: ${error.message}`);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: `Dataset analysis failed: ${error.message}` 
      };
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMessage],
        isLoading: false 
      }));
    }
  };

  const reset = () => {
    setState({
      messages: [],
      currentStep: 0,
      scanComplete: false,
      isLoading: false,
      scanId: null
    });
  };

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    currentStep: state.currentStep,
    scanComplete: state.scanComplete,
    processNextQuestion,
    startDatasetAnalysis,
    reset,
    totalQuestions: FINGERPRINTING_QUESTIONS.length
  };
};