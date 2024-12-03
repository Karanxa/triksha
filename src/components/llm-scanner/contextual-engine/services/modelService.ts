import { supabase } from "@/integrations/supabase/client";
import { ApiKeys } from "@/integrations/supabase/types/common";

export const processModelRequest = async (
  provider: string,
  model: string,
  prompt: string,
  apiKey: string | undefined,
  customEndpoint?: any
) => {
  const { data, error } = await supabase.functions.invoke('process-dynamic-scan', {
    body: {
      provider,
      model,
      prompt,
      apiKey,
      customEndpoint
    }
  });

  if (error) throw error;
  return data;
};