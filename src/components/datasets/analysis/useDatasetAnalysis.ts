import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnalysisState, DatasetAnalysisProps, AnalysisResult } from "./types";
import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { Json } from "@/integrations/supabase/types/common";

export const useDatasetAnalysis = ({
  config,
  fingerprint,
  isPaused,
  isStopped,
  lastPausedStep
}: DatasetAnalysisProps) => {
  const [state, setState] = useState<AnalysisState>({
    messages: [],
    isLoading: false,
    originalPrompts: [],
    analysisResults: null,
    phase: 'augmenting',
    progress: lastPausedStep?.phase === 'dataset_analysis' ? lastPausedStep.progress || 0 : 0
  });

  const updateState = (updates: Partial<AnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addMessage = (message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  };

  useEffect(() => {
    const analyzeDataset = async () => {
      if (isPaused || isStopped) {
        updateState({ isLoading: false });
        return;
      }
      
      updateState({ isLoading: true });
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: profile } = await supabase
          .from('profiles')
          .select('api_keys')
          .single();

        const apiKeys = profile?.api_keys;
        if (!apiKeys?.openai) {
          throw new Error('OpenAI API key not found. Please add it in Settings.');
        }

        // Get dataset content
        const { data: dataset } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (!dataset) throw new Error('Dataset not found');

        // Download and parse CSV
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path);

        if (downloadError) throw downloadError;

        const text = await fileData.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const headers = lines[0].toLowerCase().split(',');
        const promptIndex = headers.findIndex(header => 
          header === 'prompts' || header === 'prompt' || header === 'text' || header === 'original_prompt'
        );

        if (promptIndex === -1) throw new Error('No prompt column found in dataset');

        const prompts = lines.slice(1)
          .map(line => {
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            return values[promptIndex]?.replace(/^"|"$/g, '').trim();
          })
          .filter(Boolean);

        updateState({ originalPrompts: prompts });
        addMessage({
          role: 'system',
          content: `Starting dataset analysis for ${config.model} with ${prompts.length} prompts identified`
        });

        if (!isStopped) {
          // Process dataset with fingerprint results and test with target model
          const { data: analysisData, error } = await supabase.functions.invoke('process-geraide-scan', {
            body: {
              datasetId: config.datasetId,
              provider: config.provider,
              model: config.model,
              fingerprint,
              startFromProgress: lastPausedStep?.progress || 0
            }
          });

          if (error) throw error;

          updateState({ 
            analysisResults: analysisData.results,
            phase: 'testing'
          });

          // Add messages for each processed prompt
          analysisData.results.forEach((result: AnalysisResult) => {
            addMessage({ 
              role: 'system', 
              content: `Original prompt: ${result.originalPrompt}`
            });
            addMessage({ 
              role: 'assistant', 
              content: `Augmented prompt: ${result.augmentedPrompt}`
            });
            addMessage({ 
              role: 'user', 
              content: `Testing with ${config.model}...`
            });
            addMessage({ 
              role: 'assistant', 
              content: `Model response: ${result.modelResponse}`
            });
          });
        }

        if (isStopped) {
          addMessage({ 
            role: 'system', 
            content: 'Scan stopped manually by user' 
          });
          
          const messagesJson = state.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })) as unknown as Json;

          const scanData = {
            user_id: user.id,
            provider: config.provider,
            model: config.model,
            name: `Dataset Analysis - ${dataset.name}`,
            messages: messagesJson,
            fingerprint_results: fingerprint as unknown as Json,
            dataset_analysis_results: state.analysisResults as Json,
            is_vulnerable: null,
            status: 'completed'
          };

          await supabase.from('geraide_scans').insert(scanData);
        }

      } catch (error) {
        console.error('Dataset analysis error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to analyze dataset');
        
        addMessage({
          role: 'system',
          content: `Error: ${error instanceof Error ? error.message : 'Failed to analyze dataset'}`
        });
      } finally {
        updateState({ 
          isLoading: false,
          progress: isStopped ? state.progress : 100
        });
      }
    };

    if (!isPaused && !isStopped) {
      analyzeDataset();
    }
  }, [config, fingerprint, isPaused, isStopped, lastPausedStep]);

  return state;
};