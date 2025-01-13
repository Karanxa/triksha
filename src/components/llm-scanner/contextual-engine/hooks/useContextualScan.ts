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
      console.log('Storing contextual scan:', { config, messages, fingerprintResults, isVulnerable });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const scanData: ContextualScanData = {
        user_id: user.id,
        provider: config.provider,
        model: config.model,
        messages: messagesToJson(messages),  // Transform messages to Json type
        is_vulnerable: isVulnerable,
        fingerprint_results: fingerprintResults,
      };

      console.log('Prepared scan data:', scanData);

      if (!scanId) {
        // Create new scan record
        const { data, error } = await supabase
          .from('contextual_scans')
          .insert(scanData)
          .select()
          .single();

        if (error) {
          console.error('Error creating contextual scan:', error);
          throw error;
        }
        console.log('Created new contextual scan:', data);
        setScanId(data.id);
      } else {
        // Update existing scan
        const { error } = await supabase
          .from('contextual_scans')
          .update({
            messages: messagesToJson(messages),  // Transform messages to Json type
            is_vulnerable: isVulnerable,
            fingerprint_results: fingerprintResults,
          })
          .eq('id', scanId);

        if (error) {
          console.error('Error updating contextual scan:', error);
          throw error;
        }
        console.log('Updated existing contextual scan:', scanId);
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