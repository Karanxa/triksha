import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScanFormProvider } from "./ScanFormProvider";
import { ScanFormPrompt } from "./ScanFormPrompt";
import { ScanFormSchedule } from "./ScanFormSchedule";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    }

    const allPrompts = scanType === "manual" ? [singlePrompt] : prompts;
    console.log("Submitting scan with prompts:", allPrompts);

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

      // Reset form only on success
      if (scanType === "manual") {
        setSinglePrompt("");
      } else {
        setPrompts([]);
      }
      setLabel("");
      setSchedule("none");
      setIsRecurring(false);
      
      toast.success("Scan initiated successfully");
    } catch (error) {
      console.error("Scan failed:", error);
      toast.error(`Scan failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label>Scan Type</Label>
        <Select value={scanType} onValueChange={(value: "manual" | "batch") => setScanType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select scan type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Scan</SelectItem>
            <SelectItem value="batch">Batch Scan</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      <div className="space-y-4">
        <Label>Scan Label (Optional)</Label>
        <Input 
          placeholder="Enter a label for this scan"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <ScanFormSchedule
        schedule={schedule}
        onScheduleChange={setSchedule}
        isRecurring={isRecurring}
        onRecurringChange={setIsRecurring}
      />

      <Button 
        className="w-full" 
        size="lg"
        onClick={handleSubmit}
        disabled={isScanning}
      >
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Scan...
          </>
        ) : (
          "Start LLM Scan"
        )}
      </Button>
    </div>
  );
};