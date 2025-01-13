import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScanConfig } from "../types/scan";
import { useFingerprinting } from './useFingerprinting';
import { usePhaseTransition } from './usePhaseTransition';
import { useMessageHandler } from './useMessageHandler';
import { Message } from "../types/phases";
import { usePromptAugmentation } from './usePromptAugmentation';
import { useRedTeaming } from './useRedTeaming';
import { ApiKeys } from "../types/apiKeys";
import { useContextualScan } from './useContextualScan';

export const useScanLogic = (onFingerprint?: (results: any) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pendingQuestion, setPendingQuestion] = useState(false);
  const [augmentedPrompts, setAugmentedPrompts] = useState<string[]>([]);

  const { currentPhase, phaseComplete, setPhaseComplete, transitionToNextPhase } = usePhaseTransition();
  const { messages, setMessages, addMessage, addSystemMessage, handleError } = useMessageHandler();
  const { processQuestion, FINGERPRINTING_QUESTIONS } = useFingerprinting();
  const { processDatasetPrompts } = usePromptAugmentation();
  const { processDatasetPrompt } = useRedTeaming();
  const { storeContextualScan } = useContextualScan();

  const processFingerprinting = async (config: ScanConfig) => {
    if (currentStep >= FINGERPRINTING_QUESTIONS.length) {
      return false;
    }

    setIsLoading(true);
    setPendingQuestion(true);

    try {
      const question = FINGERPRINTING_QUESTIONS[currentStep];
      addMessage({ role: 'user' as const, content: question });

      const result = await processQuestion(config.provider, config.model, question);
      
      if (result.success && result.response) {
        addMessage({ role: 'assistant' as const, content: result.response });
        setCurrentStep(prev => prev + 1);

        // Store the updated conversation after each message
        await storeContextualScan(config, messages, null);

        // Check if fingerprinting phase is complete
        if (currentStep === FINGERPRINTING_QUESTIONS.length - 1) {
          const fingerprintResults = {
            capabilities: messages[2]?.content || '',
            boundaries: messages[4]?.content || '',
            training: messages[6]?.content || '',
            languages: messages[8]?.content || '',
            safety: messages[10]?.content || ''
          };

          // Store final fingerprinting results
          await storeContextualScan(config, messages, fingerprintResults);

          if (onFingerprint) {
            onFingerprint(fingerprintResults);
          }

          setPhaseComplete(true);
          const updatedMessages = transitionToNextPhase(messages, 'fingerprinting');
          if (updatedMessages) {
            setMessages(updatedMessages as Message[]);
          }

          // Start augmentation phase
          await startAugmentationPhase(config, fingerprintResults);
        }
      }
      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    } finally {
      setIsLoading(false);
      setPendingQuestion(false);
    }
  };

  const startAugmentationPhase = async (config: ScanConfig, fingerprint: any) => {
    try {
      setIsLoading(true);
      addSystemMessage('Starting prompt augmentation phase...');

      // Get user's API keys with proper typing
      const { data: profile } = await supabase
        .from('profiles')
        .select('api_keys')
        .single();

      const apiKeys = profile?.api_keys as ApiKeys | null;
      
      if (!apiKeys?.openai) {
        throw new Error('OpenAI API key not found');
      }

      // Get dataset with proper typing
      const { data: dataset } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', config.datasetId)
        .single();

      if (!dataset) {
        throw new Error('Dataset not found');
      }

      // Load dataset prompts from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path || '');

      if (downloadError || !fileData) {
        throw new Error('Failed to load dataset file');
      }

      const text = await fileData.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const prompts = lines.slice(1); // Skip header row

      // Process dataset prompts with augmentation
      const augmented = await processDatasetPrompts(
        prompts,
        fingerprint,
        apiKeys.openai,
        addMessage
      );

      setAugmentedPrompts(augmented);
      
      // Transition to red teaming phase
      const updatedMessages = transitionToNextPhase(messages, 'augmenting');
      if (updatedMessages) {
        setMessages(updatedMessages as Message[]);
      }

      // Start red teaming phase
      await startRedTeamingPhase(config, fingerprint, augmented);

    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRedTeamingPhase = async (config: ScanConfig, fingerprint: any, prompts: string[]) => {
    try {
      setIsLoading(true);
      addSystemMessage('Starting red teaming phase...');

      for (const prompt of prompts) {
        const result = await processDatasetPrompt(
          config.provider,
          config.model,
          prompt,
          fingerprint
        );

        addMessage({ 
          role: 'user' as const, 
          content: `Testing prompt: ${prompt}` 
        });
        
        addMessage({ 
          role: 'assistant' as const, 
          content: result.response || 'No response received' 
        });

        if (result.isVulnerable) {
          addSystemMessage('⚠️ Vulnerability detected in model response');
        }
      }

      addSystemMessage('Red teaming phase completed');
      toast.success('Analysis completed successfully');

    } catch (error) {
      handleError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const startScan = async (config: ScanConfig) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      addSystemMessage(`Starting contextual analysis for ${config.model}`);
      
      // Initialize the scan in the database
      await storeContextualScan(config, messages, null);
      
      await processFingerprinting(config);
    } catch (error) {
      handleError(error as Error);
    }
  };

  const askNextQuestion = async (config: ScanConfig, isPaused: boolean) => {
    if (isPaused) {
      console.log('Scan is paused, skipping next question/prompt');
      return;
    }
    
    try {
      if (currentPhase === 'fingerprinting') {
        await processFingerprinting(config);
      }
    } catch (error) {
      handleError(error as Error);
    }
  };

  return {
    messages,
    isLoading,
    currentStep,
    pendingQuestion,
    questions: FINGERPRINTING_QUESTIONS,
    phase: currentPhase,
    startScan,
    askNextQuestion
  };
};