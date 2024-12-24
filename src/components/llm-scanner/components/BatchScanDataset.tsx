import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CSVUpload } from "../CSVUpload";
import { DatasetSelector } from "../DatasetSelector";
import { toast } from "sonner";

interface BatchScanDatasetProps {
  prompts: string[];
  onPromptsExtracted: (prompts: string[]) => void;
}

export const BatchScanDataset = ({ prompts, onPromptsExtracted }: BatchScanDatasetProps) => {
  const [selectedDataset, setSelectedDataset] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDatasetSelect = async (datasetId: string) => {
    try {
      setIsLoading(true);
      setSelectedDataset(datasetId);
      
      if (datasetId) {
        console.log('Dataset selected:', datasetId);
        onPromptsExtracted([]); // Clear existing prompts before loading new ones
      }
    } catch (error) {
      console.error('Error selecting dataset:', error);
      toast.error('Failed to load dataset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          <DatasetSelector 
            selectedDataset={selectedDataset}
            onDatasetSelect={handleDatasetSelect}
          />
          <CSVUpload 
            onPromptsExtracted={onPromptsExtracted}
            selectedDataset={selectedDataset}
            isLoading={isLoading}
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