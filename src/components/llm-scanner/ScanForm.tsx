import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ScanProgress } from "./ScanProgress";
import { ScanFormActions } from "./ScanFormActions";
import { ScanStatusHandler } from "./ScanStatusHandler";
import { ScanNotification } from "./ScanNotification";
import { useScanFormState } from "./scan-form/ScanFormState";
import { ScanFormCards } from "./scan-form/ScanFormCards";
import { ManualScanResults } from "./scan-form/ManualScanResults";
import { BatchScanResults } from "./scan-form/BatchScanResults";

export const ScanForm = () => {
  const navigate = useNavigate();
  const {
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
    customEndpoint,
    setCustomEndpoint,
    handleSubmit,
    isScanning
  } = useScanFormState();

  const handleScanSubmit = async () => {
    const promptsToSubmit = scanType === "manual" ? [singlePrompt] : prompts;
    console.log('[ScanForm] Form submission - prompts:', promptsToSubmit.length);

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

    console.log('[ScanForm] Starting scan with type:', scanType, 'prompts:', promptsToSubmit.length);
    setScanProgress(0);

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
    <div className="space-y-6">
      <ScanNotification />
      
      <div className="grid gap-6">
        {(isScanning || scanProgress > 0) && (
          <ScanProgress isScanning={isScanning} progress={scanProgress} />
        )}

        <ScanFormCards 
          scanType={scanType}
          onScanTypeChange={setScanType}
          provider={provider}
          onProviderChange={setProvider}
          customEndpoint={customEndpoint}
          onCustomEndpointChange={setCustomEndpoint}
          singlePrompt={singlePrompt}
          onSinglePromptChange={setSinglePrompt}
          prompts={prompts}
          onPromptsChange={setPrompts}
          category={category}
          onCategoryChange={setCategory}
          qps={qps}
          onQPSChange={setQPS}
          schedule={schedule}
          onScheduleChange={setSchedule}
          isRecurring={isRecurring}
          onRecurringChange={setIsRecurring}
        />

        <div className="space-y-4">
          <ScanFormActions 
            isScanning={isScanning} 
            onSubmit={handleScanSubmit}
          />

          <ScanStatusHandler
            scanId={currentScanId}
            scanType={scanType}
            onProgressUpdate={setScanProgress}
            onResultUpdate={setScanResult}
          />

          {scanType === "manual" && (
            <ManualScanResults scanResult={scanResult} />
          )}

          {scanType === "batch" && (
            <BatchScanResults scanResult={scanResult} />
          )}
        </div>
      </div>
    </div>
  );
};