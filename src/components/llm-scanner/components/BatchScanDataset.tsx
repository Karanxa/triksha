import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CSVUpload } from "../CSVUpload";
import { DatasetSelector } from "../DatasetSelector";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BatchScanDatasetProps {
  prompts: string[];
  onPromptsExtracted: (prompts: string[]) => void;
}

export const BatchScanDataset = ({ prompts, onPromptsExtracted }: BatchScanDatasetProps) => {
  const [selectedDataset, setSelectedDataset] = useState("");

  const handleDatasetSelect = async (datasetId: string) => {
    try {
      setSelectedDataset(datasetId);
      
      if (datasetId) {
        console.log('Dataset selected:', datasetId);
        onPromptsExtracted([]); // Clear existing prompts before loading new ones
      }
    } catch (error) {
      console.error('Error selecting dataset:', error);
      toast.error('Failed to load dataset');
    }
  };

  return (
    <Card className="border border-border/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="select">Select Dataset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <CSVUpload 
                onPromptsExtracted={onPromptsExtracted}
                selectedDataset={selectedDataset}
              />
            </TabsContent>

            <TabsContent value="select" className="space-y-4">
              <DatasetSelector 
                selectedDataset={selectedDataset}
                onDatasetSelect={handleDatasetSelect}
              />
            </TabsContent>
          </Tabs>

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