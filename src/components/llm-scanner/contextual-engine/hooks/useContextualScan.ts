import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContextualScanData, ScanConfig, messagesToJson } from "../types/scan";
import { Message } from "../types";

export const useContextualScan = () => {
  const [scanId, setScanId] = useState<string | null>(null);

  const storeContextualScan = async (
    config: ScanConfig,
    messages: Message[],
    fingerprintResults: any,
    isVulnerable: boolean | null = null
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const scanData: ContextualScanData = {
        user_id: user.id,
        provider: config.provider,
        model: config.model,
        messages: messagesToJson(messages),
        is_vulnerable: isVulnerable,
        fingerprint_results: fingerprintResults,
      };

      if (!scanId) {
        // Create new scan record
        const { data, error } = await supabase
          .from('contextual_scans')
          .insert(scanData)
          .select()
          .single();

        if (error) throw error;
        setScanId(data.id);
      } else {
        // Update existing scan
        const { error } = await supabase
          .from('contextual_scans')
          .update({
            messages: messagesToJson(messages),
            is_vulnerable: isVulnerable,
            fingerprint_results: fingerprintResults,
          })
          .eq('id', scanId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error storing contextual scan:', error);
      toast.error('Failed to store scan results');
    }
  };

  return {
    scanId,
    storeContextualScan
  };
};