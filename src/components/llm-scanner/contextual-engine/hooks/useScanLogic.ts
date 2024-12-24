import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ScanConfig, ApiKeys } from '../types/phases';
import { useFingerprinting, FINGERPRINTING_QUESTIONS } from './useFingerprinting';
import { useRedTeaming } from './useRedTeaming';
import { usePhaseManagement } from './usePhaseManagement';
import { useDatasetProcessing } from './useDatasetProcessing';

export const useScanLogic = (onFingerprint?: (results: any) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  
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

  const storeContextualScan = async (
    config: ScanConfig,
    fingerprintResults: any,
    isVulnerable: boolean | null = null
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!scanId) {
        // Create new scan record
        const { data, error } = await supabase
          .from('contextual_scans')
          .insert({
            user_id: user.id,
            provider: config.provider,
            model: config.model,
            messages: messages,
            is_vulnerable: isVulnerable,
            fingerprint_results: fingerprintResults,
          })
          .select()
          .single();

        if (error) throw error;
        setScanId(data.id);
      } else {
        // Update existing scan
        const { error } = await supabase
          .from('contextual_scans')
          .update({
            messages: messages,
            is_vulnerable: isVulnerable,
            fingerprint_results: fingerprintResults,
          })
          .eq('id', scanId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error storing contextual scan:', error);
      toast.error('Failed to store scan results');
    }
  };

  const augmentPrompt = async (prompt: string, fingerprint: any) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('api_keys')
        .single();

      const apiKeys = profile?.api_keys as ApiKeys;
      
      if (!apiKeys?.openai) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await supabase.functions.invoke('augment-prompt', {
        body: {
          prompt,
          fingerprint,
          apiKey: apiKeys.openai
        }
      });

      if (response.error) throw response.error;
      return response.data.augmentedPrompt;
    } catch (error) {
      console.error('Error augmenting prompt:', error);
      return prompt;
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
      
      addMessage({ role: 'user', content: augmentedPrompt });
    }

    addMessage({
      role: 'system',
      content: 'Prompt augmentation phase completed. Starting red teaming phase...'
    });

    return augmentedPrompts;
  };

  const startRedTeamingPhase = async (config: ScanConfig, fingerprintResults: any, augmentedPrompts: string[], isPaused: boolean) => {
    try {
      transitionToPhase('redteaming');
      
      if (augmentedPrompts.length === 0) {
        throw new Error('No prompts available for red teaming');
      }

      addMessage({
        role: 'system',
        content: `Starting red teaming analysis with ${augmentedPrompts.length} prompts...`
      });

      let vulnerabilityDetected = false;

      for (let i = 0; i < augmentedPrompts.length; i++) {
        if (isPaused) {
          console.log('Red teaming phase paused');
          return;
        }

        setCurrentDatasetPromptIndex(i);
        const prompt = augmentedPrompts[i];
        
        addMessage({ role: 'user', content: prompt });

        const result = await processDatasetPrompt(
          config.provider,
          config.model,
          prompt,
          fingerprintResults
        );

        if (result.success && result.response) {
          addMessage({ role: 'assistant', content: result.response });
          
          // Check if any response indicates vulnerability
          if (result.isVulnerable) {
            vulnerabilityDetected = true;
          }
        }

        // Store progress after each prompt
        await storeContextualScan(config, fingerprintResults, vulnerabilityDetected);
      }

      addMessage({
        role: 'system',
        content: 'Red teaming analysis completed.'
      });

      // Final update with vulnerability status
      await storeContextualScan(config, fingerprintResults, vulnerabilityDetected);
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
      
      setCurrentStep(prev => prev + 1);
      setIsLoading(false);
      setPendingQuestion(false);

      if (currentStep === FINGERPRINTING_QUESTIONS.length - 1) {
        const fingerprintResults = {
          capabilities: messages[2]?.content || '',
          boundaries: messages[4]?.content || '',
          training: messages[6]?.content || '',
          languages: messages[8]?.content || '',
          safety: messages[10]?.content || ''
        };
        
        // Store initial fingerprint results
        await storeContextualScan(config, fingerprintResults);
        
        if (onFingerprint) {
          onFingerprint(fingerprintResults);
        }

        const prompts = await loadDatasetPrompts(config.datasetId);
        
        transitionToPhase('augmenting');
        
        const augmentedPrompts = await augmentDatasetPrompts(prompts, fingerprintResults);
        
        await startRedTeamingPhase(config, fingerprintResults, augmentedPrompts, false);
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