import { useCallback } from 'react';
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
    transitionToRedTeaming
  } = usePhaseManagement();

  const { processQuestion } = useFingerprinting();
  const { processDatasetPrompt } = useRedTeaming();
  const {
    datasetPrompts,
    currentDatasetPromptIndex,
    setCurrentDatasetPromptIndex,
    loadDatasetPrompts
  } = useDatasetProcessing();

  const startRedTeamingPhase = async (config: ScanConfig, fingerprintResults: any) => {
    try {
      transitionToRedTeaming();
      const prompts = await loadDatasetPrompts(config.datasetId);
      
      addMessage({
        role: 'system',
        content: `Loaded ${prompts.length} prompts for testing...`
      });

      for (let i = 0; i < prompts.length; i++) {
        setCurrentDatasetPromptIndex(i);
        const prompt = prompts[i];
        
        addMessage({ role: 'user', content: prompt });

        const result = await processDatasetPrompt(
          config.provider,
          config.model,
          prompt,
          fingerprintResults
        );

        if (result.success && result.response) {
          addMessage({ role: 'assistant', content: result.response });
        }
      }

      addMessage({
        role: 'system',
        content: 'Red teaming phase completed.'
      });
    } catch (error) {
      console.error('Error in red teaming phase:', error);
      toast.error('Failed to complete red teaming phase');
    }
  };

  const processNextQuestion = useCallback(async (provider: string, model: string) => {
    if (currentStep >= FINGERPRINTING_QUESTIONS.length) {
      return false;
    }

    setIsLoading(true);
    setPendingQuestion(true);
    const question = FINGERPRINTING_QUESTIONS[currentStep];
    
    addMessage({ role: 'user', content: question });

    const result = await processQuestion(provider, model, question);
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
        
        if (onFingerprint) {
          onFingerprint(fingerprintResults);
        }
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
        if (phase === 'fingerprinting') {
          const success = await processNextQuestion(config.provider, config.model);
          if (!success && currentStep >= FINGERPRINTING_QUESTIONS.length) {
            const fingerprintResults = {
              capabilities: messages[2]?.content || '',
              boundaries: messages[4]?.content || '',
              training: messages[6]?.content || '',
              languages: messages[8]?.content || '',
              safety: messages[10]?.content || ''
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