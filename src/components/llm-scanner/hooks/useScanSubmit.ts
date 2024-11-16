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
  onSubmit: (data: {
    prompts: string[];
    provider: string;
    category: string;
    label?: string;
    schedule?: string;
    isRecurring: boolean;
    qps: number;
    customEndpoint?: CustomEndpoint;
  }) => Promise<any>;
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
    if (!provider && provider !== 'custom') {
      toast.error("Please select a provider and model");
      return;
    }

    if (provider === 'custom') {
      if (customEndpoint?.inputType === 'curl') {
        if (!customEndpoint.curlCommand || !customEndpoint.placeholder) {
          toast.error("Please provide both cURL command and placeholder");
          return;
        }
      } else {
        if (!customEndpoint?.url || !customEndpoint?.apiKey) {
          toast.error("Please provide both custom endpoint URL and API key");
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
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a new scan record
      const { data: scanData, error: scanError } = await supabase
        .from('llm_scans')
        .insert({
          user_id: user.id,
          name: label || `Scan ${new Date().toISOString()}`,
          category,
          label,
          schedule,
          is_recurring: isRecurring,
          status: 'processing'
        })
        .select()
        .single();

      if (scanError) throw scanError;

      // Call the scan-llm edge function
      const allPrompts = scanType === "manual" ? [singlePrompt] : prompts;
      const { data: result, error: functionError } = await supabase.functions.invoke('scan-llm', {
        body: {
          scanId: scanData.id,
          prompts: allPrompts,
          provider,
          category,
          schedule,
          isRecurring,
          qps,
          customEndpoint: provider === 'custom' ? customEndpoint : undefined
        }
      });

      if (functionError) throw functionError;

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