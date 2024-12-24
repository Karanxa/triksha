import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DatasetPromptResult } from "../types/datasetPrompt";
import { ApiKeys } from "../types/apiKeys";

export const useRedTeaming = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processDatasetPrompt = async (
    provider: string,
    model: string,
    prompt: string,
    fingerprintResults: any
  ): Promise<DatasetPromptResult> => {
    try {
      setIsProcessing(true);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('api_keys')
        .single();

      const apiKeys = profile?.api_keys as ApiKeys | null;
      
      if (!apiKeys?.openai) {
        throw new Error('OpenAI API key not configured');
      }

      // Call analyze-vulnerability function
      const response = await supabase.functions.invoke('analyze-vulnerability', {
        body: {
          prompt,
          fingerprint: fingerprintResults,
          phase: 'redteaming',
          apiKey: apiKeys.openai
        }
      });

      if (response.error) throw response.error;

      return {
        success: true,
        response: response.data?.response,
        isVulnerable: response.data?.vulnerability_status === 'vulnerable'
      };
    } catch (error) {
      console.error('Error processing dataset prompt:', error);
      return {
        success: false,
        response: `Error: ${error.message}`
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processDatasetPrompt,
    isProcessing
  };
};