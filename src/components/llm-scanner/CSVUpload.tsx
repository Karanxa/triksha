import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatasetSelector } from "./DatasetSelector";
import { supabase } from "@/integrations/supabase/client";

interface CSVUploadProps {
  onPromptsExtracted: (prompts: string[]) => void;
}

export const CSVUpload = ({ onPromptsExtracted }: CSVUploadProps) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    try {
      const text = await file.text();
      // Split by newlines and handle both \n and \r\n
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      
      if (lines.length === 0) {
        toast.error("CSV file is empty");
        return;
      }

      const headers = lines[0].toLowerCase().split(",").map(header => header.trim());
      const promptIndex = headers.findIndex(header => 
        header === "prompts" || header === "prompt" || header === "text"
      );

      if (promptIndex === -1) {
        toast.error("CSV must have a 'prompts', 'prompt', or 'text' column");
        return;
      }

      // Process each line, properly handling quoted values
      const prompts = lines.slice(1).map(line => {
        // Handle quoted values containing commas
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanedValues = values.map(val => val.replace(/^"|"$/g, '').trim());
        return cleanedValues[promptIndex];
      }).filter(Boolean);

      if (prompts.length === 0) {
        toast.error("No valid prompts found in the CSV file");
        return;
      }

      // Pass all prompts to the parent component
      onPromptsExtracted(prompts);
      toast.success(`${prompts.length} prompts extracted successfully`);
      
      // Reset input
      event.target.value = '';
    } catch (error) {
      console.error("CSV processing error:", error);
      toast.error("Error processing CSV file: " + (error as Error).message);
    }
  };

  const handleDatasetSelect = async (datasetId: string) => {
    try {
      // First, get the dataset details
      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .select('file_path')
        .eq('id', datasetId)
        .single();

      if (datasetError) throw datasetError;
      if (!dataset?.file_path) {
        toast.error("Dataset file not found");
        return;
      }

      // Download the file content
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('datasets')
        .download(dataset.file_path);

      if (downloadError) throw downloadError;

      // Read the file content
      const text = await fileData.text();
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      
      if (lines.length === 0) {
        toast.error("Dataset is empty");
        return;
      }

      // Assume first line is header
      const headers = lines[0].toLowerCase().split(",").map(header => header.trim());
      const promptIndex = headers.findIndex(header => 
        header === "prompts" || header === "prompt" || header === "text"
      );

      if (promptIndex === -1) {
        toast.error("Dataset must have a 'prompts', 'prompt', or 'text' column");
        return;
      }

      const prompts = lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanedValues = values.map(val => val.replace(/^"|"$/g, '').trim());
        return cleanedValues[promptIndex];
      }).filter(Boolean);

      if (prompts.length === 0) {
        toast.error("No valid prompts found in the dataset");
        return;
      }

      onPromptsExtracted(prompts);
      toast.success(`${prompts.length} prompts extracted from dataset`);

    } catch (error) {
      console.error("Dataset processing error:", error);
      toast.error("Error processing dataset: " + (error as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          <TabsTrigger value="select">Select Dataset</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full"
              onClick={() => document.getElementById("csv-upload-scanner")?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload CSV
            </Button>
          </div>
          <input
            id="csv-upload-scanner"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <p className="text-sm text-muted-foreground">
            Upload a CSV file with a 'prompts' column
          </p>
        </TabsContent>
        
        <TabsContent value="select">
          <DatasetSelector onDatasetSelect={handleDatasetSelect} />
        </TabsContent>
      </Tabs>
    </div>
  );
};