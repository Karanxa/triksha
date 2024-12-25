import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CSVUpload } from "../CSVUpload";
import { DatasetSelector } from "../DatasetSelector";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BatchScanDatasetProps {
  prompts: string[];
  onPromptsExtracted: (prompts: string[]) => void;
}

export const BatchScanDataset = ({ prompts, onPromptsExtracted }: BatchScanDatasetProps) => {
  const [selectedDataset, setSelectedDataset] = useState("");
  const [activeTab, setActiveTab] = useState<"upload" | "select">("upload");

  const { data: dataset } = useQuery({
    queryKey: ['dataset', selectedDataset],
    queryFn: async () => {
      if (!selectedDataset) return null;

      // First get dataset details
      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', selectedDataset)
        .single();

      if (datasetError) throw datasetError;

      // Then get file content
      if (dataset?.file_path) {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path);

        if (downloadError) throw downloadError;

        const text = await fileData.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        
        if (lines.length === 0) {
          throw new Error("Dataset is empty");
        }

        // Parse CSV headers
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const promptIndex = headers.findIndex(h => 
          h === 'prompt' || h === 'text' || h === 'content'
        );

        if (promptIndex === -1) {
          throw new Error("Dataset must have a prompt, text, or content column");
        }

        // Extract prompts
        const prompts = lines.slice(1)
          .map(line => {
            const values = line.split(',');
            return values[promptIndex]?.trim() || '';
          })
          .filter(Boolean);

        if (prompts.length === 0) {
          throw new Error("No valid prompts found in dataset");
        }

        return { dataset, prompts };
      }
      return null;
    },
    enabled: !!selectedDataset,
    meta: {
      onSuccess: (data: { dataset: any; prompts: string[] } | null) => {
        if (data?.prompts) {
          onPromptsExtracted(data.prompts);
          toast.success(`Loaded ${data.prompts.length} prompts from dataset`);
        }
      },
      onError: (error: Error) => {
        toast.error("Failed to load dataset: " + error.message);
        setSelectedDataset("");
      }
    }
  });

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDataset(datasetId);
    if (!datasetId) {
      onPromptsExtracted([]);
    }
  };

  return (
    <Card className="border border-border/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as "upload" | "select")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="select">Select Dataset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <CSVUpload 
                onPromptsExtracted={onPromptsExtracted}
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