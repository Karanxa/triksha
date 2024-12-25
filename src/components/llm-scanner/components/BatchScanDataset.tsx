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

  const handleDatasetSelect = async (datasetId: string) => {
    try {
      setSelectedDataset(datasetId);
      
      if (datasetId) {
        console.log('Dataset selected:', datasetId);
        
        // Get dataset details
        const { data: dataset, error: datasetError } = await supabase
          .from('datasets')
          .select('file_path')
          .eq('id', datasetId)
          .single();

        if (datasetError) throw datasetError;
        if (!dataset?.file_path) {
          throw new Error('Dataset file not found');
        }

        // Download the file content
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path);

        if (downloadError) throw downloadError;

        // Parse CSV content
        const text = await fileData.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const headers = lines[0].toLowerCase().split(',');
        
        // Find prompt column
        const promptIndex = headers.findIndex(header => 
          header === 'prompts' || header === 'prompt' || header === 'text'
        );

        if (promptIndex === -1) {
          throw new Error('Dataset must have a prompts, prompt, or text column');
        }

        // Extract prompts from CSV
        const extractedPrompts = lines.slice(1)
          .map(line => {
            const values = line.split(',').map(val => val.trim().replace(/^"|"$/g, ''));
            return values[promptIndex];
          })
          .filter(Boolean);

        if (extractedPrompts.length === 0) {
          throw new Error('No valid prompts found in dataset');
        }

        console.log(`Extracted ${extractedPrompts.length} prompts from dataset`);
        onPromptsExtracted(extractedPrompts);
        toast.success(`${extractedPrompts.length} prompts loaded from dataset`);
      }
    } catch (error) {
      console.error('Error selecting dataset:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load dataset');
      onPromptsExtracted([]);
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