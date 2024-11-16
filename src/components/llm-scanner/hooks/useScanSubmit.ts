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
    // Validate inputs based on whether it's a custom endpoint or not
    if (!customEndpoint && !provider) {
      toast.error("Please select a provider and model");
      return;
    }

    if (customEndpoint && customEndpoint.inputType === 'curl') {
      if (!customEndpoint.curlCommand || !customEndpoint.placeholder) {
        toast.error("Please provide both cURL command and placeholder");
        return;
      }
    } else if (customEndpoint && customEndpoint.inputType === 'manual') {
      if (!customEndpoint.url || !customEndpoint.apiKey) {
        toast.error("Please provide both endpoint URL and API key");
        return;
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
      const promptsToScan = scanType === "manual" ? [singlePrompt] : prompts;

      const result = await onSubmit({
        prompts: promptsToScan,
        provider: customEndpoint ? 'custom' : provider,
        category,
        label,
        schedule,
        isRecurring,
        qps,
        customEndpoint
      });

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