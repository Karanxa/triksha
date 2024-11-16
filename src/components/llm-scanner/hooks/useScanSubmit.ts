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

    const baseProvider = provider.split('-')[0];

    if (baseProvider === 'ollama') {
      const { data: profile, error: profileError } = await supabase.from('profiles').select('api_keys').single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Failed to fetch profile settings");
        return;
      }

      const ollamaEndpoint = profile?.api_keys?.['ollama_endpoint'] as string | undefined;
      
      if (!ollamaEndpoint) {
        toast.error("Please configure your Ollama endpoint URL in Settings");
        return;
      }
      
      try {
        new URL(ollamaEndpoint);
      } catch (error) {
        console.error("Invalid Ollama endpoint URL:", error);
        toast.error("Invalid Ollama endpoint URL. Please check your settings.");
        return;
      }
    }

    const allPrompts = scanType === "manual" ? [singlePrompt] : prompts;
    setIsScanning(true);

    try {
      const result = await onSubmit({
        prompts: allPrompts,
        provider,
        category,
        label: label || undefined,
        schedule: schedule !== "none" ? schedule : undefined,
        isRecurring,
        qps,
        customEndpoint: provider === 'custom' ? customEndpoint : undefined
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