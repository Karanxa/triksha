import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { ScanFormProvider } from "./ScanFormProvider";
import { ScanFormSchedule } from "./ScanFormSchedule";
import { QPSControl } from "./QPSControl";
import { ScanResults } from "./ScanResults";
import { ScanTypeSelect } from "./ScanTypeSelect";
import { ScanPromptInput } from "./ScanPromptInput";
import { useScanSubmit } from "./hooks/useScanSubmit";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CustomEndpoint } from "./types/CustomEndpoint";
import { ScanProgress } from "./ScanProgress";
import { ScanFormActions } from "./ScanFormActions";

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
    onSubmit,
    setResult: setScanResult,
    setScanId: setCurrentScanId
  });

  useEffect(() => {
    if (!currentScanId) return;

    const subscription = supabase
      .channel(`scan_${currentScanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'llm_scans',
          filter: `id=eq.${currentScanId}`,
        },
        (payload) => {
          if (payload.new.status === 'processing') {
            const progress = payload.new.results?.progress || 0;
            setScanProgress(progress);
          } else if (payload.new.status === 'completed') {
            setScanProgress(100);
            toast.success('Scan completed successfully');
            setScanResult(payload.new.results?.responses || []);
          } else if (payload.new.status === 'failed') {
            toast.error('Scan failed: ' + (payload.new.results?.error || 'Unknown error'));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentScanId]);

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

    const result = await handleSubmit({
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

      <ScanProgress isScanning={isScanning} progress={scanProgress} />

      <ScanFormActions isScanning={isScanning} onSubmit={onFormSubmit} />

      {scanResult && (
        <div className="mt-8">
          <ScanResults result={scanResult} />
        </div>
      )}
    </div>
  );
};