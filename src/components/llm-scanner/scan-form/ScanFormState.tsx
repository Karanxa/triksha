import { useState } from "react";
import { useScanSubmit } from "../hooks/useScanSubmit";

export const useScanFormState = () => {
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
  const [customEndpoint, setCustomEndpoint] = useState({
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
        console.log('[ScanForm] Starting scan with data:', {
          scanType,
          promptCount: scanType === "manual" ? 1 : prompts.length,
          provider,
          category
        });
        
        setScanProgress(0);
        
        const promptsToSubmit = scanType === "manual" ? [singlePrompt] : prompts;
        if (promptsToSubmit.length === 0) {
          toast.error("Please enter at least one prompt");
          return;
        }

        if (!provider) {
          toast.error("Please select a provider");
          return;
        }

        console.log('[ScanForm] Submitting scan with prompts:', promptsToSubmit.length);
        toast.info(`Processing ${promptsToSubmit.length} prompts...`);

        const result = await handleSubmit({
          provider,
          customEndpoint,
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
          
          if (scanType === "batch") {
            console.log('[ScanForm] Batch scan completed, navigating to results');
            toast.success('Batch scan started successfully');
            navigate('/llm-results');
          }
          
          return result;
        }
      } catch (error) {
        console.error("[ScanForm] Scan submission error:", error);
        toast.error("Failed to start scan: " + (error instanceof Error ? error.message : "Unknown error"));
      }
    },
    setResult: setScanResult,
    setScanId: setCurrentScanId
  });

  return {
    scanType,
    setScanType,
    provider,
    setProvider,
    singlePrompt,
    setSinglePrompt,
    prompts,
    setPrompts,
    category,
    setCategory,
    label,
    setLabel,
    schedule,
    setSchedule,
    isRecurring,
    setIsRecurring,
    qps,
    setQPS,
    scanResult,
    setScanResult,
    scanProgress,
    setScanProgress,
    currentScanId,
    setCurrentScanId,
    customEndpoint,
    setCustomEndpoint,
    handleSubmit,
    isScanning
  };
};
