import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CSVUpload } from "../CSVUpload";
import { DatasetSelector } from "../DatasetSelector";

interface BatchScanDatasetProps {
  prompts: string[];
  onPromptsExtracted: (prompts: string[]) => void;
}

export const BatchScanDataset = ({ prompts, onPromptsExtracted }: BatchScanDatasetProps) => {
  const [selectedDataset, setSelectedDataset] = useState("");

  return (
    <Card className="border border-border/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          <DatasetSelector 
            selectedDataset={selectedDataset}
            onDatasetSelect={(datasetId) => {
              setSelectedDataset(datasetId);
              // This will trigger the dataset loading in CSVUpload
              if (datasetId) {
                onPromptsExtracted([]); // Clear existing prompts
              }
            }}
          />
          <CSVUpload 
            onPromptsExtracted={onPromptsExtracted}
            selectedDataset={selectedDataset}
          />
          {prompts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {prompts.length} prompts loaded
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};