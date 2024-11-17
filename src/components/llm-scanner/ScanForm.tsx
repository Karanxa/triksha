import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { ScanFormProvider } from "./ScanFormProvider";
import { ScanFormSchedule } from "./ScanFormSchedule";
import { QPSControl } from "./QPSControl";
import { Loader2 } from "lucide-react";
import { ScanResults } from "./ScanResults";
import { ScanTypeSelect } from "./ScanTypeSelect";
import { ScanPromptInput } from "./ScanPromptInput";
import { useScanSubmit } from "./hooks/useScanSubmit";

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
    qps: number;
    customEndpoint?: CustomEndpoint;
  }) => Promise<any>;
}

export const ScanForm = ({ onSubmit }: ScanFormProps) => {
  const [scanType, setScanType] = useState("manual");
  const [provider, setProvider] = useState("");
  const [singlePrompt, setSinglePrompt] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [label, setLabel] = useState("");
  const [schedule, setSchedule] = useState("none");
  const [isRecurring, setIsRecurring] = useState(false);
  const [qps, setQPS] = useState(5);
  const [scanResult, setScanResult] = useState<any>(null);
  const [customEndpoint, setCustomEndpoint] = useState<CustomEndpoint>({
    url: '',
    apiKey: '',
    headers: '',
    placeholder: '{PROMPT}',
    curlCommand: '',
    inputType: 'manual'
  });

  const { handleSubmit, isScanning } = useScanSubmit({
    onSubmit,
    setResult: setScanResult
  });

  const onFormSubmit = async () => {
    // Validate input size
    if (scanType === "batch" && prompts.length > 100000) {
      toast.error("Maximum batch size is 100,000 prompts");
      return;
    }

    const result = await handleSubmit({
      provider,
      customEndpoint,
      scanType,
      singlePrompt,
      prompts,
      category,
      label,
      schedule,
      isRecurring,
      qps: Math.min(qps, 50) // Ensure QPS doesn't exceed 50
    });

    if (result) {
      // Only reset form on successful submission
      setSinglePrompt("");
      setPrompts([]);
      setLabel("");
      setSchedule("none");
      setIsRecurring(false);
    }
  };

  return (
    <div className="space-y-8">
      <ScanTypeSelect scanType={scanType} onScanTypeChange={setScanType} />

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

      <ScanPromptInput
        scanType={scanType}
        singlePrompt={singlePrompt}
        onSinglePromptChange={setSinglePrompt}
        prompts={prompts}
        onPromptsExtracted={setPrompts}
      />

      <div className="space-y-4">
        <Label>Attack Category</Label>
        <AttackCategorySelect
          value={category}
          onValueChange={setCategory}
        />
      </div>

      <QPSControl qps={qps} onQPSChange={setQPS} />

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
        onClick={onFormSubmit}
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

      {scanResult && (
        <div className="mt-8">
          <ScanResults result={scanResult} />
        </div>
      )}
    </div>
  );
};
