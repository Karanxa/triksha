import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    console.log('Starting scan with params:', {
      provider,
      customEndpoint,
      scanType,
      prompts: scanType === "manual" ? [singlePrompt] : prompts,
      category,
      label,
      schedule,
      isRecurring,
      qps
    });

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

      console.log('Created scan record:', scanData);

      // Now submit the scan with the created ID
      const response = await supabase.functions.invoke('scan-llm', {
        body: {
          scanId: scanData.id,
          prompts: promptsToScan,
          provider: customEndpoint ? undefined : provider,
          category,
          label,
          schedule,
          isRecurring,
          qps,
          customEndpoint
        }
      });

      console.log('Edge function response:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('No response data received from scan');
      }

      const { results } = response.data;
      console.log('Scan results:', results);

      setResult(results);
      toast.success("Scan completed successfully");
      return results;
    } catch (error) {
      console.error("Scan failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Scan failed: ${errorMessage}`);
      setResult({ error: errorMessage });
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  return { handleSubmit, isScanning };
};