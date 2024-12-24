import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Message } from "../types";
import { ScanState, ScanConfig } from "../types/scan";
import { useFingerprinting } from './useFingerprinting';
import { useRedTeaming } from './useRedTeaming';
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
  const { processDatasetPrompt } = useRedTeaming();

  const displayDatasetPrompts = (prompts: string[]) => {
    setState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          role: 'system',
          content: `Loading ${prompts.length} prompts for testing...`
        },
        ...prompts.map((prompt, index): Message => ({
          role: 'system',
          content: `Prompt ${index + 1}/${prompts.length}: ${prompt}`
        }))
      ]
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

      // Process each prompt in the dataset
      for (let i = 0; i < state.datasetPrompts.length; i++) {
        const prompt = state.datasetPrompts[i];
        setState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            { role: 'user', content: `Testing prompt ${i + 1}/${state.datasetPrompts.length}: ${prompt}` }
          ],
          currentDatasetPromptIndex: i
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
    
    return true;
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
            }
          ],
          datasetPrompts: prompts
        }));

        displayDatasetPrompts(prompts);
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
        await processNextQuestion(config.provider, config.model);
      } catch (error) {
        console.error('Error asking next question:', error);
        toast.error("Failed to process question/prompt");
      }
    }
  };
};

async function loadDatasetPrompts(datasetId: string): Promise<string[]> {
  try {
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('file_path')
      .eq('id', datasetId)
      .single();

    if (datasetError) throw datasetError;
    if (!dataset?.file_path) {
      throw new Error('Dataset file not found');
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('datasets')
      .download(dataset.file_path);

    if (downloadError) throw downloadError;

    const text = await fileData.text();
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const headers = lines[0].toLowerCase().split(',');
    const promptIndex = headers.findIndex(h => 
      h === 'prompt' || h === 'text' || h === 'content'
    );

    if (promptIndex === -1) {
      throw new Error('Dataset must have a prompt, text, or content column');
    }

    return lines.slice(1)
      .map(line => {
        const values = line.split(',');
        return values[promptIndex]?.trim() || '';
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Error loading dataset:', error);
    toast.error('Failed to load dataset prompts');
    return [];
  }
}