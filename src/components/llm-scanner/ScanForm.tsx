import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ScanFormHeader } from "./ScanFormHeader";
import { ScanFormProvider } from "./ScanFormProvider";
import { ScanFormPrompt } from "./ScanFormPrompt";
import { ScanFormSchedule } from "./ScanFormSchedule";
import { ScanFormLabel } from "./ScanFormLabel";
import { ScanFormSubmit } from "./ScanFormSubmit";
import { ScanResults } from "./ScanResults";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { Label } from "@/components/ui/label";
import { useScanSubmission } from "./hooks/useScanSubmission";
import { CustomEndpoint, ScanFormProps } from "./types";

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

  const { scanResult, submitScan } = useScanSubmission();

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

    const result = await submitScan({
      provider,
      scanType,
      singlePrompt,
      prompts,
      category,
      label,
      schedule,
      isRecurring,
      customEndpoint
    });

    if (result) {
      if (scanType === "manual") {
        setSinglePrompt("");
      } else {
        setPrompts([]);
      }
      setLabel("");
      setSchedule("none");
      setIsRecurring(false);
      
      toast.success("Scan completed successfully");
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

      {scanResult && (
        <ScanResults 
          result={scanResult}
          isLoading={isScanning}
        />
      )}
    </div>
  );
};