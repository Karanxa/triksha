import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ScanConfig } from '../types/phases';
import { useFingerprinting, FINGERPRINTING_QUESTIONS } from './useFingerprinting';
import { useRedTeaming } from './useRedTeaming';
import { usePhaseManagement } from './usePhaseManagement';
import { useDatasetProcessing } from './useDatasetProcessing';

export const useScanLogic = (onFingerprint?: (results: any) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    messages,
    phase,
    currentStep,
    pendingQuestion,
    setCurrentStep,
    setPendingQuestion,
    addMessage,
    transitionToPhase
  } = usePhaseManagement();

  const { processQuestion } = useFingerprinting();
  const { processDatasetPrompt } = useRedTeaming();
  const {
    datasetPrompts,
    currentDatasetPromptIndex,
    setCurrentDatasetPromptIndex,
    loadDatasetPrompts
  } = useDatasetProcessing();

  const augmentPrompt = async (prompt: string, fingerprint: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('api_keys')
        .single();

      if (!profile?.api_keys?.openai) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await supabase.functions.invoke('augment-prompt', {
        body: {
          prompt,
          fingerprint,
          apiKey: profile.api_keys.openai
        }
      });

      if (response.error) throw response.error;
      return response.data.augmentedPrompt;
    } catch (error) {
      console.error('Error augmenting prompt:', error);
      return prompt; // Return original prompt if augmentation fails
    }
  };

  const augmentDatasetPrompts = async (prompts: string[], fingerprintResults: any) => {
    addMessage({
      role: 'system',
      content: `Starting prompt augmentation phase with ${prompts.length} prompts...`
    });

    const augmentedPrompts = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      const augmentedPrompt = await augmentPrompt(prompt, fingerprintResults);
      augmentedPrompts.push(augmentedPrompt);
      
      // Add messages to show the augmentation process
      addMessage({ role: 'user', content: `Original: ${prompt}` });
      addMessage({ role: 'assistant', content: `Augmented: ${augmentedPrompt}` });
    }

    addMessage({
      role: 'system',
      content: 'Prompt augmentation phase completed. Starting red teaming phase...'
    });

    return augmentedPrompts;
  };

  const startRedTeamingPhase = async (config: ScanConfig, fingerprintResults: any, augmentedPrompts: string[]) => {
    try {
      transitionToPhase('redteaming');
      
      if (augmentedPrompts.length === 0) {
        throw new Error('No prompts available for red teaming');
      }

      addMessage({
        role: 'system',
        content: `Starting red teaming analysis with ${augmentedPrompts.length} augmented prompts...`
      });

      // Process each augmented prompt
      for (let i = 0; i < augmentedPrompts.length; i++) {
        setCurrentDatasetPromptIndex(i);
        const prompt = augmentedPrompts[i];
        
        // Add the augmented prompt as a user message
        addMessage({ 
          role: 'user', 
          content: prompt.trim()
        });

        const result = await processDatasetPrompt(
          config.provider,
          config.model,
          prompt,
          fingerprintResults
        );

        if (result.success && result.response) {
          // Add the model's response as an assistant message
          addMessage({ 
            role: 'assistant', 
            content: result.response.trim()
          });
        }
      }

      addMessage({
        role: 'system',
        content: 'Red teaming analysis completed.'
      });
    } catch (error) {
      console.error('Error in red teaming phase:', error);
      toast.error('Failed to complete red teaming phase');
    }
  };

  const processNextQuestion = useCallback(async (config: ScanConfig) => {
    if (currentStep >= FINGERPRINTING_QUESTIONS.length) {
      return false;
    }

    setIsLoading(true);
    setPendingQuestion(true);
    const question = FINGERPRINTING_QUESTIONS[currentStep];
    
    addMessage({ role: 'user', content: question });

    const result = await processQuestion(config.provider, config.model, question);
    if (result.success && result.response) {
      addMessage({ role: 'assistant', content: result.response });
      
      // Increment step
      setCurrentStep(prev => prev + 1);
      setIsLoading(false);
      setPendingQuestion(false);

      // Check if fingerprinting is complete
      if (currentStep === FINGERPRINTING_QUESTIONS.length - 1) {
        const fingerprintResults = {
          capabilities: messages[2]?.content || '',
          boundaries: messages[4]?.content || '',
          training: messages[6]?.content || '',
          languages: messages[8]?.content || '',
          safety: messages[10]?.content || ''
        };
        
        if (onFingerprint) {
          onFingerprint(fingerprintResults);
        }

        // Load dataset prompts
        const prompts = await loadDatasetPrompts(config.datasetId);
        
        // Transition to augmentation phase
        transitionToPhase('augmenting');
        
        // Augment the prompts
        const augmentedPrompts = await augmentDatasetPrompts(prompts, fingerprintResults);
        
        // Start red teaming phase with augmented prompts
        await startRedTeamingPhase(config, fingerprintResults, augmentedPrompts);
      }
      return true;
    }
    
    setIsLoading(false);
    setPendingQuestion(false);
    return false;
  }, [currentStep, messages, onFingerprint]);

  return {
    messages,
    isLoading,
    currentStep,
    pendingQuestion,
    questions: FINGERPRINTING_QUESTIONS,
    phase,
    startScan: async (config: ScanConfig) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        addMessage({
          role: 'system',
          content: `Starting contextual analysis for ${config.model}`
        });

        await processNextQuestion(config);
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
        if (phase === 'fingerprinting') {
          await processNextQuestion(config);
        }
      } catch (error) {
        console.error('Error asking next question:', error);
        toast.error("Failed to process question/prompt");
      }
    }
  };
};