import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CSVUpload } from "../CSVUpload";
import { DatasetSelector } from "../DatasetSelector";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface BatchScanDatasetProps {
  prompts: string[];
  onPromptsExtracted: (prompts: string[]) => void;
}

export const BatchScanDataset = ({ prompts, onPromptsExtracted }: BatchScanDatasetProps) => {
  const [selectedDataset, setSelectedDataset] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadDatasetPrompts = async (datasetId: string) => {
    try {
      setIsLoading(true);
      console.log('Loading prompts from dataset:', datasetId);
      
      const { data: dataset, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single();

      if (error) throw error;

      if (!dataset.file_path) {
        throw new Error('Dataset file path not found');
      }

      // Download the dataset file
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('datasets')
        .download(dataset.file_path);

      if (downloadError) throw downloadError;

      // Read the file content
      const text = await fileData.text();
      const lines = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      console.log(`Loaded ${lines.length} prompts from dataset`);
      onPromptsExtracted(lines);
      toast.success(`Loaded ${lines.length} prompts from dataset`);

    } catch (error) {
      console.error('Error loading dataset:', error);
      toast.error('Failed to load dataset prompts');
      onPromptsExtracted([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDatasetSelect = async (datasetId: string) => {
    try {
      setSelectedDataset(datasetId);
      
      if (datasetId) {
        console.log('Dataset selected:', datasetId);
        await loadDatasetPrompts(datasetId);
      } else {
        onPromptsExtracted([]);
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
            
            <TabsContent value="upload">
              <CSVUpload 
                onPromptsExtracted={onPromptsExtracted}
              />
            </TabsContent>
            
            <TabsContent value="select">
              <DatasetSelector 
                selectedDataset={selectedDataset}
                onDatasetSelect={handleDatasetSelect}
              />
            </TabsContent>
          </Tabs>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading prompts...</p>
          ) : prompts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {prompts.length} prompts loaded
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};