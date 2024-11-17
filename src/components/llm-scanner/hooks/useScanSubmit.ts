import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types/common";

interface CustomEndpoint {
  url: string;
  apiKey: string;
  headers: string;
  placeholder: string;
  curlCommand: string;
  inputType: 'curl' | 'manual';
}

interface ScanSubmitProps {
  onSubmit: (data: any) => Promise<any>;
  setResult: (result: any) => void;
}

export const useScanSubmit = ({ onSubmit, setResult }: ScanSubmitProps) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = async ({
    provider,
    customEndpoint,
    scanType,
    singlePrompt,
    prompts,
    category,
    label,
    schedule,
    isRecurring,
    qps
  }: {
    provider: string;
    customEndpoint?: CustomEndpoint;
    scanType: string;
    singlePrompt: string;
    prompts: string[];
    category: string;
    label: string;
    schedule: string;
    isRecurring: boolean;
    qps: number;
  }) => {
    // Validate inputs based on whether it's a custom endpoint or regular provider
    if (!customEndpoint && !provider) {
      toast.error("Please select a provider and model");
      return;
    }

    if (customEndpoint) {
      if (customEndpoint.inputType === 'curl') {
        if (!customEndpoint.curlCommand || !customEndpoint.placeholder) {
          toast.error("Please provide both cURL command and placeholder");
          return;
        }
      } else if (customEndpoint.inputType === 'manual') {
        if (!customEndpoint.url || !customEndpoint.apiKey) {
          toast.error("Please provide both endpoint URL and API key");
          return;
        }
      }
    }

    if (scanType === "manual" && !singlePrompt) {
      toast.error("Please enter a prompt");
      return;
    }

    if (scanType === "batch" && prompts.length === 0) {
      toast.error("Please upload a CSV file with prompts");
      return;
    }

    if (!category) {
      toast.error("Please select an attack category");
      return;
    }

    setIsScanning(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const promptsToScan = scanType === "manual" ? [singlePrompt] : prompts;

      // Create a new scan record first with the user_id
      const { data: scanData, error: scanError } = await supabase
        .from('llm_scans')
        .insert({
          user_id: user.id,
          name: label || `Scan ${new Date().toISOString()}`,
          category,
          label,
          schedule,
          is_recurring: isRecurring,
          status: 'pending'
        })
        .select()
        .single();

      if (scanError) {
        throw new Error(`Failed to create scan: ${scanError.message}`);
      }

      // Now submit the scan with the created ID
      const result = await onSubmit({
        scanId: scanData.id,
        prompts: promptsToScan,
        provider: customEndpoint ? undefined : provider,
        category,
        label,
        schedule,
        isRecurring,
        qps,
        customEndpoint
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setResult(result);
      toast.success("Scan completed successfully");
      return result;
    } catch (error) {
      console.error("Scan failed:", error);
      toast.error(`Scan failed: ${(error as Error).message}`);
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  return { handleSubmit, isScanning };
};