import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { ScanFormProvider } from "./ScanFormProvider";
import { ScanFormSchedule } from "./ScanFormSchedule";
import { QPSControl } from "./QPSControl";
import { ScanResults } from "./ScanResults";
import { ScanTypeSelect } from "./ScanTypeSelect";
import { ScanPromptInput } from "./ScanPromptInput";
import { ScanProgress } from "./ScanProgress";
import { ScanFormActions } from "./ScanFormActions";
import { ScanStatusHandler } from "./ScanStatusHandler";
import { CustomEndpoint } from "./types/CustomEndpoint";

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
  const navigate = useNavigate();
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
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [customEndpoint, setCustomEndpoint] = useState<CustomEndpoint>({
    url: '',
    apiKey: '',
    headers: '',
    placeholder: '{PROMPT}',
    curlCommand: '',
    httpRequest: '',
    inputType: 'manual',
    method: 'POST'
  });

  const onFormSubmit = async () => {
    const promptsToSubmit = scanType === "manual" ? [singlePrompt] : prompts;

    if (promptsToSubmit.length === 0) {
      toast.error("Please enter at least one prompt");
      return;
    }

    if (promptsToSubmit.length > 100000) {
      toast.error("Maximum batch size is 100,000 prompts");
      return;
    }

    if (promptsToSubmit.length > 1000) {
      toast.info(`Processing ${promptsToSubmit.length} prompts. This may take a while.`);
    }

    const result = await onSubmit({
      provider,
      customEndpoint,
      scanType,
      singlePrompt,
      prompts: promptsToSubmit,
      category,
      label,
      schedule,
      isRecurring,
      qps: Math.min(qps, 50)
    });

    if (result) {
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
        <AttackCategorySelect
          value={category}
          onValueChange={setCategory}
        />
      </div>

      <QPSControl qps={qps} onQPSChange={setQPS} />

      <ScanFormSchedule
        schedule={schedule}
        onScheduleChange={setSchedule}
        isRecurring={isRecurring}
        onRecurringChange={setIsRecurring}
      />

      <ScanProgress isScanning={Boolean(currentScanId)} progress={scanProgress} />

      <ScanFormActions 
        isScanning={Boolean(currentScanId)} 
        onSubmit={onFormSubmit} 
      />

      <ScanStatusHandler
        scanId={currentScanId}
        scanType={scanType}
        onProgressUpdate={setScanProgress}
        onResultUpdate={setScanResult}
      />

      {scanType === "manual" && scanResult && (
        <div className="mt-8">
          <ScanResults result={scanResult} />
        </div>
      )}

      {scanType === "batch_scan" && scanResult && (
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate('/llm-results')}>
            View Results
          </Button>
        </div>
      )}
    </div>
  );
};