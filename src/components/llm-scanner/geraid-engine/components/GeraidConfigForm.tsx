import { ModelSelector } from "../ModelSelector";
import { Button } from "@/components/ui/button";
import { DatasetSelector } from "../DatasetSelector";
import { CustomEndpoint } from "../../types/CustomEndpoint";
import { Card, CardContent } from "@/components/ui/card";

interface GeraidConfigFormProps {
  selectedProvider: string;
  selectedModel: string;
  selectedDataset: string;
  customEndpoint?: CustomEndpoint;
  onProviderChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onDatasetChange: (value: string) => void;
  onCustomEndpointChange: (endpoint: CustomEndpoint) => void;
  onStart: () => void;
}

export const GeraidConfigForm = ({
  selectedProvider,
  selectedModel,
  selectedDataset,
  customEndpoint,
  onProviderChange,
  onModelChange,
  onDatasetChange,
  onCustomEndpointChange,
  onStart
}: GeraidConfigFormProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Geraide-E Model Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a target model and dataset to begin the analysis process. This will help understand the model's capabilities, limitations, and security boundaries.
            </p>
          </div>
          
          <ModelSelector
            provider={selectedProvider}
            model={selectedModel}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
            customEndpoint={customEndpoint}
            onCustomEndpointChange={onCustomEndpointChange}
          />

          <DatasetSelector
            value={selectedDataset}
            onValueChange={onDatasetChange}
          />

          <Button 
            onClick={onStart}
            className="w-full"
            disabled={!selectedProvider || (!selectedModel && selectedProvider !== "custom") || !selectedDataset}
          >
            Start Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};