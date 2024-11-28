import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message } from '../types';
import { CustomEndpoint } from '../../types/CustomEndpoint';
import { FINGERPRINTING_QUESTIONS } from '../constants/questions';
import { ScanState } from '../types/scan';

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
    if (state.currentStep >= FINGERPRINTING_QUESTIONS.length) {
      setState(prev => ({ ...prev, scanComplete: true }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    const question = FINGERPRINTING_QUESTIONS[state.currentStep];

    try {
      console.log('Processing question:', { provider, model, question });
      
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

      if (error) {
        console.error('Error from geraide-fingerprint:', error);
        throw error;
      }

      if (!data?.response) {
        throw new Error('No response received from the model');
      }

      console.log('Received response:', data.response);

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
            messages: finalMessages,
            user_id: (await supabase.auth.getUser()).data.user?.id
          })
          .select()
          .single();

        if (scanError) {
          console.error('Error creating scan:', scanError);
          throw scanError;
        }

        console.log('Created new scan:', scanData);
        
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
            messages: finalMessages,
          })
          .eq('id', state.scanId);

        if (updateError) {
          console.error('Error updating scan:', updateError);
          throw updateError;
        }

        setState(prev => ({
          ...prev,
          messages: finalMessages,
          currentStep: prev.currentStep + 1,
          isLoading: false
        }));
      }

      return true;
    } catch (error) {
      console.error('Error in fingerprinting:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      const errorMessage: Message = { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, errorMessage],
        isLoading: false 
      }));
      return false;
    }
  }, [state.currentStep, state.messages, state.scanId]);

  const startDatasetAnalysis = async (
    datasetId: string,
    fingerprint: any,
    provider: string,
    model: string,
    customEndpoint?: CustomEndpoint
  ) => {
    try {
      console.log('Starting dataset analysis:', { datasetId, provider, model });
      
      setState(prev => ({ ...prev, isLoading: true }));
      
      const systemMessage: Message = { 
        role: 'system', 
        content: 'Starting dataset analysis with fingerprint results...' 
      };
      
      setState(prev => ({ ...prev, messages: [...prev.messages, systemMessage] }));

      const { data, error } = await supabase.functions.invoke('process-geraide-scan', {
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

      setState(prev => ({ 
        ...prev, 
        messages: [...prev.messages, 
          { role: 'system', content: 'Dataset analysis complete' }
        ],
        isLoading: false 
      }));

    } catch (error) {
      console.error('Dataset analysis error:', error);
      toast.error(`Dataset analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: `Dataset analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
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