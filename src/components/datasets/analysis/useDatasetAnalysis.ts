import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AnalysisState, DatasetAnalysisProps, AnalysisResult } from "./types";
import { Message } from "@/components/llm-scanner/contextual-scan/types";
import { ApiKeys } from "@/integrations/supabase/types/common";
import { verifyModelResponse } from "./utils/modelResponseVerifier";
import { addResultMessages } from "./utils/messageHandler";

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

        const apiKeys = profile?.api_keys as ApiKeys;
        if (!apiKeys?.openai) {
          throw new Error('OpenAI API key not found. Please add it in Settings.');
        }

        const { data: dataset } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (!dataset) throw new Error('Dataset not found');

        const { data: analysisData, error } = await supabase.functions.invoke('process-contextual-scan', {
          body: {
            datasetId: config.datasetId,
            provider: config.provider,
            model: config.model,
            fingerprint,
            startFromProgress: lastPausedStep?.progress || 0
          }
        });

        if (error) {
          console.error('Error from process-contextual-scan:', error);
          throw error;
        }

        if (!verifyModelResponse(analysisData)) {
          throw new Error('Invalid response format from analysis');
        }

        const results = analysisData.results as AnalysisResult[];
        updateState({ 
          analysisResults: results,
          phase: 'testing',
          progress: 100
        });

        results.forEach(result => {
          addResultMessages(result, config, addMessage);
        });

        if (isStopped) {
          addMessage({ 
            role: 'system', 
            content: 'Scan stopped manually by user' 
          });
          
          await supabase.from('contextual_scans').insert([{
            user_id: user.id,
            provider: config.provider,
            model: config.model,
            messages: state.messages,
            fingerprint_results: fingerprint,
            dataset_analysis_results: state.analysisResults,
            is_vulnerable: null
          }]);
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
