import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScanFormHeader } from "./ScanFormHeader";
import { ScanFormProvider } from "./ScanFormProvider";
import { ScanFormPrompt } from "./ScanFormPrompt";
import { ScanFormSchedule } from "./ScanFormSchedule";
import { ScanFormLabel } from "./ScanFormLabel";
import { ScanFormSubmit } from "./ScanFormSubmit";
import { ScanFormCustomEndpoint } from "./ScanFormCustomEndpoint";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface CustomEndpoint {
  url: string;
  apiKey: string;
  headers: string;
  placeholder: string;
  curlCommand: string;
  inputType: 'curl' | 'manual';
}

interface ScanFormProps {
  onSubmit: (data: {
    prompts: string[];
    provider: string;
    category: string;
    label?: string;
    schedule?: string;
    isRecurring: boolean;
    customEndpoint?: CustomEndpoint;
  }) => Promise<void>;
  isScanning: boolean;
}

export const ScanForm = ({ onSubmit, isScanning }: ScanFormProps) => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState("");
  const [singlePrompt, setSinglePrompt] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [label, setLabel] = useState("");
  const [schedule, setSchedule] = useState("none");
  const [isRecurring, setIsRecurring] = useState(false);
  const [scanType, setScanType] = useState<"manual" | "batch">("manual");
  const [customEndpoint, setCustomEndpoint] = useState<CustomEndpoint>({
    url: '',
    apiKey: '',
    headers: '',
    placeholder: '{PROMPT}',
    curlCommand: '',
    inputType: 'manual'
  });

  const handleSubmit = async () => {
    if (!provider && provider !== 'custom') {
      toast.error("Please select a provider and model");
      return;
    }

    if (provider === 'custom') {
      if (customEndpoint.inputType === 'curl') {
        if (!customEndpoint.curlCommand || !customEndpoint.placeholder) {
          toast.error("Please provide both cURL command and placeholder");
          return;
        }
      } else {
        if (!customEndpoint.url || !customEndpoint.apiKey) {
          toast.error("Please provide both custom endpoint URL and API key");
          return;
        }
      }
    }

    if (scanType === "manual" && !singlePrompt) {
      toast.error("Please enter a prompt for manual scan");
      return;
    }

    if (scanType === "batch" && prompts.length === 0) {
      toast.error("Please upload a CSV file for batch scan");
      return;
    }

    if (!category) {
      toast.error("Please select an attack category");
      return;
    }

    const baseProvider = provider.split('-')[0];

    if (baseProvider === 'ollama') {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('api_keys')
        .single();
      
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
    }

    const allPrompts = scanType === "manual" ? [singlePrompt] : prompts;

    try {
      await onSubmit({
        prompts: allPrompts,
        provider,
        category,
        label: label || `${scanType === "manual" ? "Manual" : "Batch"} Scan - ${new Date().toLocaleString()}`,
        schedule: schedule !== "none" ? schedule : undefined,
        isRecurring,
        customEndpoint: provider === 'custom' ? customEndpoint : undefined
      });

      if (scanType === "manual") {
        setSinglePrompt("");
      } else {
        setPrompts([]);
      }
      setLabel("");
      setSchedule("none");
      setIsRecurring(false);
      
      toast.success("Scan initiated successfully");
      // Navigate to results page after successful scan
      navigate("/llm-results");
    } catch (error) {
      console.error("Scan failed:", error);
      toast.error(`Scan failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-8">
      <ScanFormHeader scanType={scanType} onScanTypeChange={setScanType} />

      <ScanFormProvider 
        provider={provider}
        onProviderChange={setProvider}
        customEndpoint={customEndpoint}
        onCustomEndpointChange={(endpoint: Partial<CustomEndpoint>) => {
          setCustomEndpoint(prev => ({
            ...prev,
            ...endpoint
          }));
        }}
      />

      <ScanFormPrompt
        singlePrompt={singlePrompt}
        onSinglePromptChange={(value) => {
          setSinglePrompt(value);
          setPrompts([]);
        }}
        prompts={prompts}
        onPromptsExtracted={(extractedPrompts) => {
          setPrompts(extractedPrompts);
          setSinglePrompt("");
        }}
        scanType={scanType}
      />

      <div className="space-y-4">
        <Label>Attack Category</Label>
        <AttackCategorySelect
          value={category}
          onValueChange={setCategory}
        />
      </div>

      <ScanFormLabel label={label} onLabelChange={setLabel} />

      <ScanFormSchedule
        schedule={schedule}
        onScheduleChange={setSchedule}
        isRecurring={isRecurring}
        onRecurringChange={setIsRecurring}
      />

      <ScanFormSubmit onSubmit={handleSubmit} isScanning={isScanning} />
    </div>
  );
};