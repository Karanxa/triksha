import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Message } from "../types";
import { ScanState, ScanConfig } from "../types/scan";
import { useFingerprinting } from './useFingerprinting';
import { useDatasetPrompts } from './useDatasetPrompts';
import { supabase } from "@/integrations/supabase/client";

export const useScanLogic = (onFingerprint?: (results: any) => void) => {
  const [state, setState] = useState<ScanState>({
    messages: [],
    isLoading: false,
    currentStep: 0,
    pendingQuestion: false,
    phase: 'fingerprinting',
    datasetPrompts: [],
    currentDatasetPromptIndex: 0
  });

  const { FINGERPRINTING_QUESTIONS, processQuestion } = useFingerprinting();
  const { loadDatasetPrompts } = useDatasetPrompts();

  const displayDatasetPrompts = (prompts: string[]) => {
    const messages: Message[] = [
      {
        role: 'system',
        content: `Dataset loaded with ${prompts.length} prompts to test:`
      },
      ...prompts.map((prompt, index): Message => ({
        role: 'system',
        content: `Prompt ${index + 1}/${prompts.length}: ${prompt}`
      }))
    ];

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, ...messages]
    }));
  };

  const startRedTeamingPhase = async (config: ScanConfig, fingerprintResults: any) => {
    try {
      const prompts = await loadDatasetPrompts(config.datasetId);
      if (!prompts || prompts.length === 0) {
        throw new Error('No prompts found in dataset');
      }

      displayDatasetPrompts(prompts);

      setState(prev => ({
        ...prev,
        phase: 'redteaming',
        messages: [
          ...prev.messages,
          {
            role: 'system',
            content: `Starting red teaming phase with ${prompts.length} prompts from the selected dataset.`
          }
        ],
        datasetPrompts: prompts,
        currentDatasetPromptIndex: 0
      }));

      await processNextDatasetPrompt(config.provider, config.model);
    } catch (error) {
      console.error('Error starting red teaming phase:', error);
      toast.error("Failed to start red teaming phase");
    }
  };

  const processNextDatasetPrompt = async (provider: string, model: string): Promise<boolean> => {
    const { datasetPrompts, currentDatasetPromptIndex } = state;
    
    if (currentDatasetPromptIndex >= datasetPrompts.length) {
      console.log('Red teaming phase completed');
      toast.success("Red teaming phase completed");
      return false;
    }

    const prompt = datasetPrompts[currentDatasetPromptIndex];
    setState(prev => ({
      ...prev,
      isLoading: true,
      messages: [...prev.messages, {
        role: 'user',
        content: `Testing prompt ${currentDatasetPromptIndex + 1}/${datasetPrompts.length}: ${prompt}`
      }]
    }));

    try {
      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: { provider, model, prompt }
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: data.response }],
        currentDatasetPromptIndex: prev.currentDatasetPromptIndex + 1,
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error processing dataset prompt:', error);
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          role: 'system',
          content: `Error processing prompt: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        isLoading: false
      }));
      return false;
    }
  };

  const processNextQuestion = useCallback(async (provider: string, model: string) => {
    if (state.phase === 'fingerprinting') {
      if (state.currentStep >= FINGERPRINTING_QUESTIONS.length) {
        const fingerprintResults = {
          capabilities: state.messages[2]?.content || '',
          boundaries: state.messages[4]?.content || '',
          training: state.messages[6]?.content || '',
          languages: state.messages[8]?.content || '',
          safety: state.messages[10]?.content || ''
        };
        
        if (onFingerprint) {
          onFingerprint(fingerprintResults);
        }
        
        await startRedTeamingPhase({ provider, model, datasetId: '' }, fingerprintResults);
        return false;
      }

      setState(prev => ({ ...prev, isLoading: true, pendingQuestion: true }));
      const question = FINGERPRINTING_QUESTIONS[state.currentStep];
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'user', content: question }]
      }));

      const result = await processQuestion(provider, model, question);
      if (result.success && result.response) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, { role: 'assistant', content: result.response }],
          currentStep: prev.currentStep + 1,
          isLoading: false,
          pendingQuestion: false
        }));
        return true;
      }
      
      setState(prev => ({ ...prev, isLoading: false, pendingQuestion: false }));
      return false;
    }
    
    return processNextDatasetPrompt(provider, model);
  }, [state, onFingerprint, FINGERPRINTING_QUESTIONS]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    currentStep: state.currentStep,
    pendingQuestion: state.pendingQuestion,
    questions: FINGERPRINTING_QUESTIONS,
    phase: state.phase,
    startScan: async (config: ScanConfig) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const prompts = await loadDatasetPrompts(config.datasetId);
        if (!prompts || prompts.length === 0) {
          throw new Error('No prompts found in dataset');
        }

        setState(prev => ({
          ...prev,
          messages: [
            {
              role: 'system',
              content: `Starting contextual analysis for ${config.model}`
            },
            {
              role: 'system',
              content: `Loaded dataset with ${prompts.length} prompts for testing`
            }
          ],
          datasetPrompts: prompts
        }));

        displayDatasetPrompts(prompts);

        setState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: 'system',
              content: 'Beginning fingerprinting phase...'
            }
          ]
        }));
        
        await processNextQuestion(config.provider, config.model);
      } catch (error) {
        console.error('Error starting scan:', error);
        toast.error("Failed to start scan");
      }
    },
    processNextQuestion,
    askNextQuestion: async (config: ScanConfig, isPaused: boolean) => {
      if (isPaused) {
        console.log('Scan is paused, skipping next question/prompt');
        return;
      }
      
      try {
        const success = await processNextQuestion(config.provider, config.model);
        if (!success) {
          console.log('No more questions/prompts to process');
        }
      } catch (error) {
        console.error('Error asking next question:', error);
        toast.error("Failed to process question/prompt");
      }
    }
  };
};