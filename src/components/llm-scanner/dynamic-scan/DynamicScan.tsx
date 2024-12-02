import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ModelSelector } from "../contextual-engine/ModelSelector";
import { DatasetSelector } from "../contextual-engine/DatasetSelector";
import { Button } from "@/components/ui/button";
import { DatasetChat } from "../contextual-engine/components/DatasetChat";
import { CustomEndpoint } from "../types/CustomEndpoint";
import { toast } from "sonner";

export const DynamicScan = () => {
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState<CustomEndpoint>({
    url: '',
    apiKey: '',
    headers: '',
    placeholder: '{PROMPT}',
    curlCommand: '',
    inputType: 'manual',
    method: 'POST'
  });

  const handleStart = () => {
    if (!provider || (!model && provider !== 'custom')) {
      toast.error("Please select a provider and model");
      return;
    }

    if (!selectedDataset) {
      toast.error("Please select a dataset");
      return;
    }

    setIsStarted(true);
  };

  const handlePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleStop = () => {
    setIsStopped(true);
  };

  const handleProgress = (progress: number) => {
    console.log('Scan progress:', progress);
  };

  if (!isStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dynamic Dataset Scan</CardTitle>
            <CardDescription>
              Test your model against a dataset and analyze its responses in real-time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ModelSelector
              provider={provider}
              model={model}
              onProviderChange={setProvider}
              onModelChange={setModel}
              customEndpoint={customEndpoint}
              onCustomEndpointChange={(endpoint) => setCustomEndpoint(prev => ({ ...prev, ...endpoint }))}
            />

            <DatasetSelector
              value={selectedDataset}
              onValueChange={setSelectedDataset}
            />

            <Button 
              onClick={handleStart}
              className="w-full"
              disabled={!provider || (!model && provider !== 'custom') || !selectedDataset}
            >
              Start Dynamic Scan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={handlePause}
        >
          {isPaused ? "Resume" : "Pause"}
        </Button>
        <Button
          variant="destructive"
          onClick={handleStop}
        >
          Stop Scan
        </Button>
      </div>

      <DatasetChat
        config={{
          provider,
          model,
          datasetId: selectedDataset,
          customEndpoint
        }}
        fingerprint={{}}
        isPaused={isPaused}
        isStopped={isStopped}
        onProgress={handleProgress}
      />
    </div>
  );
};