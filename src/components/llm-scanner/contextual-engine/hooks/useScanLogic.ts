import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ScanState, ScanConfig, Message } from '../types/phases';
import { useFingerprinting, FINGERPRINTING_QUESTIONS } from './useFingerprinting';
import { useRedTeaming } from './useRedTeaming';
import { useDatasetPrompts } from './useDatasetPrompts';

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

  const { processQuestion } = useFingerprinting();
  const { processDatasetPrompt } = useRedTeaming();
  const { loadDatasetPrompts } = useDatasetPrompts();

  const addMessage = (message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };

  const startRedTeamingPhase = async (config: ScanConfig, fingerprintResults: any) => {
    try {
      setState(prev => ({
        ...prev,
        phase: 'redteaming',
        messages: [
          ...prev.messages,
          {
            role: 'system',
            content: 'Starting red teaming phase with dataset prompts...'
          }
        ]
      }));

      // Load dataset prompts
      const prompts = await loadDatasetPrompts(config.datasetId);
      setState(prev => ({
        ...prev,
        datasetPrompts: prompts,
        messages: [
          ...prev.messages,
          {
            role: 'system',
            content: `Loaded ${prompts.length} prompts for testing...`
          }
        ]
      }));

      // Process each prompt
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        setState(prev => ({
          ...prev,
          currentDatasetPromptIndex: i,
          messages: [
            ...prev.messages,
            { role: 'user', content: prompt }
          ]
        }));

        const result = await processDatasetPrompt(
          config.provider,
          config.model,
          prompt,
          fingerprintResults
        );

        if (result.success && result.response) {
          setState(prev => ({
            ...prev,
            messages: [
              ...prev.messages,
              { role: 'assistant', content: result.response }
            ]
          }));
        }
      }

      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: 'system',
            content: 'Red teaming phase completed.'
          }
        ]
      }));
    } catch (error) {
      console.error('Error in red teaming phase:', error);
      toast.error('Failed to complete red teaming phase');
    }
  };

  const processNextQuestion = useCallback(async (provider: string, model: string) => {
    if (state.currentStep >= FINGERPRINTING_QUESTIONS.length) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, pendingQuestion: true }));
    const question = FINGERPRINTING_QUESTIONS[state.currentStep];
    
    addMessage({ role: 'user', content: question });

    const result = await processQuestion(provider, model, question);
    if (result.success && result.response) {
      addMessage({ role: 'assistant', content: result.response });
      
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        isLoading: false,
        pendingQuestion: false
      }));

      // If this was the last fingerprinting question, prepare for red teaming
      if (state.currentStep === FINGERPRINTING_QUESTIONS.length - 1) {
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
      }
      return true;
    }
    
    setState(prev => ({ ...prev, isLoading: false, pendingQuestion: false }));
    return false;
  }, [state.currentStep, state.messages]);

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

        setState(prev => ({
          ...prev,
          messages: [
            {
              role: 'system',
              content: `Starting contextual analysis for ${config.model}`
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
        if (state.phase === 'fingerprinting') {
          const success = await processNextQuestion(config.provider, config.model);
          if (!success && state.currentStep >= FINGERPRINTING_QUESTIONS.length) {
            const fingerprintResults = {
              capabilities: state.messages[2]?.content || '',
              boundaries: state.messages[4]?.content || '',
              training: state.messages[6]?.content || '',
              languages: state.messages[8]?.content || '',
              safety: state.messages[10]?.content || ''
            };
            await startRedTeamingPhase(config, fingerprintResults);
          }
        }
      } catch (error) {
        console.error('Error asking next question:', error);
        toast.error("Failed to process question/prompt");
      }
    }
  };
};