import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Message } from "../types";
import { ScanState, ScanConfig } from "../types/scan";
import { useFingerprinting } from './useFingerprinting';
import { useRedTeaming } from './useRedTeaming';

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

  const [scanId, setScanId] = useState<string | null>(null);
  const { processQuestion, FINGERPRINTING_QUESTIONS } = useFingerprinting();
  const { loadDatasetPrompts, processPrompt } = useRedTeaming();

  const startRedTeamingPhase = async (config: ScanConfig, fingerprintResults: any) => {
    console.log('Starting red teaming phase');
    setState(prev => ({
      ...prev,
      phase: 'redteaming',
      messages: [
        ...prev.messages,
        { 
          role: 'system', 
          content: "Fingerprinting phase complete. Starting red teaming phase with dataset prompts." 
        }
      ]
    }));

    try {
      const prompts = await loadDatasetPrompts(config.datasetId);
      setState(prev => ({
        ...prev,
        datasetPrompts: prompts
      }));

      if (prompts.length > 0) {
        await processNextQuestion(config.provider, config.model);
      }
    } catch (error) {
      console.error('Error starting red teaming phase:', error);
      toast.error("Failed to start red teaming phase");
    }
  };

  const processNextQuestion = useCallback(async (provider: string, model: string) => {
    if (state.phase === 'fingerprinting') {
      if (state.currentStep >= FINGERPRINTING_QUESTIONS.length) {
        // Process fingerprinting results when all questions are answered
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
        
        // Start red teaming phase
        await startRedTeamingPhase({ provider, model, datasetId: '' }, fingerprintResults);
        return false;
      }

      setState(prev => ({ ...prev, isLoading: true, pendingQuestion: true }));
      const question = FINGERPRINTING_QUESTIONS[state.currentStep];
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'user', content: question }]
      }));

      const result = await processQuestion(provider, model, question, state.currentStep);

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
    } else {
      // Red teaming phase
      if (state.currentDatasetPromptIndex >= state.datasetPrompts.length) {
        toast.success("Red teaming phase completed");
        return false;
      }

      const prompt = state.datasetPrompts[state.currentDatasetPromptIndex];
      setState(prev => ({
        ...prev,
        isLoading: true,
        messages: [...prev.messages, { role: 'user', content: prompt }]
      }));

      const result = await processPrompt(provider, model, prompt);

      if (result.success && result.response) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, { role: 'assistant', content: result.response }],
          currentDatasetPromptIndex: prev.currentDatasetPromptIndex + 1,
          isLoading: false
        }));
        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state, onFingerprint, FINGERPRINTING_QUESTIONS]);

  const startScan = async (config: ScanConfig) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: scanData, error: scanError } = await supabase
        .from('contextual_scans')
        .insert({
          user_id: user.id,
          provider: config.provider,
          model: config.model,
          messages: [],
          is_vulnerable: null
        })
        .select()
        .single();

      if (scanError) throw scanError;
      setScanId(scanData.id);

      // Add initial system message
      setState(prev => ({
        ...prev,
        messages: [
          {
            role: 'system',
            content: `Starting contextual analysis for ${config.model} - Fingerprinting Phase`
          }
        ]
      }));
      
      // Process the first question immediately
      await processNextQuestion(config.provider, config.model);
      
      return scanData.id;
    } catch (error) {
      console.error('Error starting scan:', error);
      toast.error("Failed to start scan");
      return null;
    }
  };

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    currentStep: state.currentStep,
    pendingQuestion: state.pendingQuestion,
    questions: FINGERPRINTING_QUESTIONS,
    phase: state.phase,
    startScan,
    processNextQuestion,
    askNextQuestion: async (config: ScanConfig, isPaused: boolean) => {
      if (isPaused) {
        console.log('Scan is paused, skipping next question');
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