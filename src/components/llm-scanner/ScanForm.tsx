import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import { ScanNotification } from "./ScanNotification";
import { CustomEndpoint } from "./types/CustomEndpoint";
import { useScanSubmit } from "./hooks/useScanSubmit";

export const ScanForm = () => {
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

  const { handleSubmit, isScanning } = useScanSubmit({
    onSubmit: async (data) => {
      try {
        const result = await handleSubmit({
          provider,
          customEndpoint,
          prompts: scanType === "manual" ? [singlePrompt] : prompts,
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
          
          // For batch scans, show a notification and optionally redirect
          if (scanType === "batch") {
            toast.success('Batch scan started successfully', {
              description: 'You can navigate away - the scan will continue in the background.'
            });
          }
          
          return result;
        }
      } catch (error) {
        console.error("Scan submission error:", error);
        toast.error("Failed to start scan: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    },
    setResult: setScanResult,
    setScanId: setCurrentScanId
  });

  const onFormSubmit = async () => {
    const promptsToSubmit = scanType === "manual" ? [singlePrompt] : prompts;

    if (promptsToSubmit.length === 0) {
      toast.error("Please enter at least one prompt");
      return;
    }

    if (!provider) {
      toast.error("Please select a provider");
      return;
    }

    if (promptsToSubmit.length > 100000) {
      toast.error("Maximum batch size is 100,000 prompts");
      return;
    }

    if (promptsToSubmit.length > 1000) {
      toast.info(`Processing ${promptsToSubmit.length} prompts. This may take a while.`);
    }

    await handleSubmit({
      provider,
      customEndpoint,
      prompts: promptsToSubmit,
      category,
      label,
      schedule,
      isRecurring,
      qps: Math.min(qps, 50)
    });
  };

  return (
    <div className="space-y-8">
      <ScanNotification />
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

      {scanType === "batch" && (
        <QPSControl qps={qps} onQPSChange={setQPS} />
      )}

      <ScanFormSchedule
        schedule={schedule}
        onScheduleChange={setSchedule}
        isRecurring={isRecurring}
        onRecurringChange={setIsRecurring}
      />

      <ScanProgress isScanning={Boolean(currentScanId)} progress={scanProgress} />

      <ScanFormActions 
        isScanning={isScanning} 
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

      {scanType === "batch" && scanResult && (
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate('/llm-results')}>
            View Results
          </Button>
        </div>
      )}
    </div>
  );
};