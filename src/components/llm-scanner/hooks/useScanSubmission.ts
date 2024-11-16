import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CustomEndpoint } from "../types";

export const useScanSubmission = () => {
  const [scanResult, setScanResult] = useState<any>(null);

  const submitScan = async ({
    provider,
    scanType,
    singlePrompt,
    prompts,
    category,
    label,
    schedule,
    isRecurring,
    customEndpoint
  }: {
    provider: string;
    scanType: "manual" | "batch";
    singlePrompt: string;
    prompts: string[];
    category: string;
    label: string;
    schedule: string;
    isRecurring: boolean;
    customEndpoint: CustomEndpoint;
  }) => {
    try {
      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("Authentication error. Please sign in again.");
        return null;
      }

      const allPrompts = scanType === "manual" ? [singlePrompt] : prompts;

      // Create the scan record
      const { data: scan, error: createError } = await supabase
        .from('llm_scans')
        .insert({
          user_id: user.id,
          name: label || `${scanType === "manual" ? "Manual" : "Batch"} Scan - ${new Date().toLocaleString()}`,
          status: 'pending',
          category,
          label,
          schedule: schedule !== "none" ? schedule : undefined,
          is_recurring: isRecurring,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Call the edge function
      const { data: result, error: scanError } = await supabase.functions.invoke('scan-llm', {
        body: { 
          scanId: scan.id,
          prompts: allPrompts,
          provider,
          category,
          customEndpoint: provider === 'custom' ? customEndpoint : undefined
        }
      });

      if (scanError) throw scanError;

      setScanResult(result);
      return result;
    } catch (error) {
      console.error("Scan failed:", error);
      toast.error(`Scan failed: ${(error as Error).message}`);
      return null;
    }
  };

  return {
    scanResult,
    submitScan
  };
};