import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { ScanFormProvider } from "./ScanFormProvider";
import { ScanFormSchedule } from "./ScanFormSchedule";
import { QPSControl } from "./QPSControl";
import { ScanTypeSelect } from "./ScanTypeSelect";
import { ScanPromptInput } from "./ScanPromptInput";
import { ScanProgress } from "./ScanProgress";
import { ScanFormActions } from "./ScanFormActions";
import { ScanStatusHandler } from "./ScanStatusHandler";
import BatchScanDataset from "./components/BatchScanDataset";
import { useScanSubmit } from "./hooks/useScanSubmit";
import { useBatchScan } from "./hooks/useBatchScan";

export const ScanForm = () => {
  const navigate = useNavigate();
  const [scanType, setScanType] = useState("manual");
  const [provider, setProvider] = useState("");
  const [singlePrompt, setSinglePrompt] = useState("");
  const [category, setCategory] = useState("");
  const [label, setLabel] = useState("");
  const [schedule, setSchedule] = useState("none");
  const [isRecurring, setIsRecurring] = useState(false);
  const [qps, setQPS] = useState(5);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState("");

  const { handleSubmit, isScanning } = useScanSubmit({
    onSubmit: async (data) => {
      try {
        const result = await handleSubmit({
          provider,
          prompts: data.prompts,
          category,
          label,
          schedule,
          isRecurring,
          qps: Math.min(qps, 50)
        });

        if (result) {
          setSinglePrompt("");
          setLabel("");
          setSchedule("none");
          setIsRecurring(false);
          
          toast.success('Scan started successfully', {
            description: 'You can navigate away - the scan will continue in the background.'
          });
          
          navigate('/llm-results');
          return result;
        }
      } catch (error) {
        console.error("Scan submission error:", error);
        toast.error("Failed to start scan: " + (error instanceof Error ? error.message : "Unknown error"));
        return null;
      }
    },
    setCurrentScanId
  });

  const { startBatchScan, isProcessing } = useBatchScan();

  const onFormSubmit = async () => {
    try {
      if (scanType === "manual") {
        if (!singlePrompt) {
          toast.error("Please enter a prompt");
          return;
        }

        await handleSubmit({
          provider,
          prompts: [singlePrompt],
          category,
          label,
          schedule,
          isRecurring,
          qps
        });
      } else {
        if (!selectedDataset) {
          toast.error("Please select a dataset");
          return;
        }

        await startBatchScan(selectedDataset, provider, category, async (prompts) => {
          await handleSubmit({
            provider,
            prompts,
            category,
            label,
            schedule,
            isRecurring,
            qps
          });
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border/50">
        <CardContent className="p-6">
          <ScanTypeSelect scanType={scanType} onScanTypeChange={setScanType} />
        </CardContent>
      </Card>

      <Card className="border border-border/50">
        <CardContent className="p-6">
          <ScanFormProvider 
            provider={provider}
            onProviderChange={setProvider}
          />
        </CardContent>
      </Card>

      {scanType === "manual" ? (
        <Card className="border border-border/50">
          <CardContent className="p-6">
            <ScanPromptInput
              scanType={scanType}
              singlePrompt={singlePrompt}
              onSinglePromptChange={setSinglePrompt}
            />
          </CardContent>
        </Card>
      ) : (
        <BatchScanDataset
          selectedDataset={selectedDataset}
          onDatasetSelect={setSelectedDataset}
        />
      )}

      <Card className="border border-border/50">
        <CardContent className="p-6 space-y-6">
          {scanType === "batch" && (
            <QPSControl qps={qps} onQPSChange={setQPS} />
          )}

          <ScanFormSchedule
            schedule={schedule}
            onScheduleChange={setSchedule}
            isRecurring={isRecurring}
            onRecurringChange={setIsRecurring}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <ScanProgress isScanning={Boolean(currentScanId)} progress={scanProgress} />
        <ScanFormActions 
          isScanning={isScanning || isProcessing} 
          onSubmit={onFormSubmit} 
        />
      </div>

      <ScanStatusHandler
        scanId={currentScanId}
        scanType={scanType}
        onProgress={setScanProgress}
      />
    </div>
  );
};