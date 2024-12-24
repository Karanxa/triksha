import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRedTeaming = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processDatasetPrompt = async (
    provider: string,
    model: string,
    prompt: string,
    fingerprintResults: any
  ): Promise<{ success: boolean; response?: string }> => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: {
          provider,
          model,
          prompt,
          fingerprint: fingerprintResults
        }
      });

      if (error) throw error;
      return { success: true, response: data.response };
    } catch (error) {
      console.error('Error processing red team prompt:', error);
      toast.error('Failed to process dataset prompt');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processDatasetPrompt,
    isProcessing
  };
};