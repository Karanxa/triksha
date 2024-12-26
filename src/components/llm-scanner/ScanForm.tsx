import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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
import BatchScanDataset from "./components/BatchScanDataset";
import { useScanSubmit } from "./hooks/useScanSubmit";
import { supabase } from "@/integrations/supabase/client";

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
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState("");

  const { handleSubmit, isScanning } = useScanSubmit({
    onSubmit: async (data) => {
      try {
        // If batch scan with dataset, load prompts from dataset
        if (scanType === "batch" && selectedDataset) {
          const { data: dataset, error: datasetError } = await supabase
            .from('datasets')
            .select('file_path')
            .eq('id', selectedDataset)
            .single();

          if (datasetError) throw datasetError;
          if (!dataset?.file_path) {
            throw new Error('Dataset file not found');
          }

          // Download and process the dataset file
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('datasets')
            .download(dataset.file_path);

          if (downloadError) throw downloadError;

          const text = await fileData.text();
          const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
          const headers = lines[0].toLowerCase().split(',');
          const promptIndex = headers.findIndex(h => 
            h === 'prompt' || h === 'text' || h === 'content'
          );

          if (promptIndex === -1) {
            throw new Error('Dataset must have a prompt, text, or content column');
          }

          const datasetPrompts = lines.slice(1)
            .map(line => {
              const values = line.split(',');
              return values[promptIndex]?.trim() || '';
            })
            .filter(Boolean);

          if (datasetPrompts.length === 0) {
            throw new Error('No valid prompts found in dataset');
          }

          // Use dataset prompts for the scan
          const result = await handleSubmit({
            provider,
            prompts: datasetPrompts,
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
            
            toast.success('Batch scan started successfully', {
              description: 'You can navigate away - the scan will continue in the background.'
            });
            navigate('/llm-results');
            
            return result;
          }
        } else {
          // Handle manual scan or CSV upload case
          const promptsToSubmit = scanType === "manual" ? [singlePrompt] : prompts;
          return await handleSubmit({
            provider,
            prompts: promptsToSubmit,
            category,
            label,
            schedule,
            isRecurring,
            qps: Math.min(qps, 50)
          });
        }
      } catch (error) {
        console.error("Scan submission error:", error);
        toast.error("Failed to start scan: " + (error instanceof Error ? error.message : "Unknown error"));
        return null;
      }
    },
    setResult: setScanResult,
    setScanId: setCurrentScanId
  });

  const onFormSubmit = async () => {
    const promptsToSubmit = scanType === "manual" ? [singlePrompt] : prompts;

    if (promptsToSubmit.length === 0 && !selectedDataset) {
      toast.error("Please enter at least one prompt or select a dataset");
      return;
    }

    if (!provider) {
      toast.error("Please select a provider");
      return;
    }

    await handleSubmit({
      provider,
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
              prompts={prompts}
              onPromptsExtracted={setPrompts}
            />
          </CardContent>
        </Card>
      ) : (
        <BatchScanDataset
          prompts={prompts}
          onPromptsExtracted={setPrompts}
          selectedDataset={selectedDataset}
          onDatasetSelect={setSelectedDataset}
        />
      )}

      <Card className="border border-border/50">
        <CardContent className="p-6 space-y-6">
          <AttackCategorySelect
            value={category}
            onValueChange={setCategory}
          />

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
        <ScanFormActions isScanning={isScanning} onSubmit={onFormSubmit} />
      </div>

      <ScanStatusHandler
        scanId={currentScanId}
        scanType={scanType}
        onResultUpdate={setScanResult}
        onProgress={setScanProgress}
      />

      {scanType === "manual" && scanResult && (
        <Card className="border-border/50 mt-8">
          <CardContent className="p-6">
            <ScanResults result={scanResult} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};