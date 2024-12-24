import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScanConfig } from "../types/scan";
import { useFingerprinting } from './useFingerprinting';
import { usePhaseTransition } from './usePhaseTransition';
import { useMessageHandler } from './useMessageHandler';

export const useScanLogic = (onFingerprint?: (results: any) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pendingQuestion, setPendingQuestion] = useState(false);

  const { currentPhase, phaseComplete, setPhaseComplete, transitionToNextPhase } = usePhaseTransition();
  const { messages, setMessages, addMessage, addSystemMessage, handleError } = useMessageHandler();
  const { processQuestion, FINGERPRINTING_QUESTIONS } = useFingerprinting();

  const processFingerprinting = async (config: ScanConfig) => {
    if (currentStep >= FINGERPRINTING_QUESTIONS.length) {
      return false;
    }

    setIsLoading(true);
    setPendingQuestion(true);

    try {
      const question = FINGERPRINTING_QUESTIONS[currentStep];
      addMessage({ role: 'user', content: question });

      const result = await processQuestion(config.provider, config.model, question);
      
      if (result.success && result.response) {
        addMessage({ role: 'assistant', content: result.response });
        setCurrentStep(prev => prev + 1);

        // Check if fingerprinting phase is complete
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

          setPhaseComplete(true);
          const updatedMessages = transitionToNextPhase(messages, 'fingerprinting');
          if (updatedMessages) {
            setMessages(updatedMessages);
          }
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

  const startScan = async (config: ScanConfig) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      addSystemMessage(`Starting contextual analysis for ${config.model}`);
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