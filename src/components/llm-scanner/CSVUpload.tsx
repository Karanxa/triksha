import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { parseCSVContent } from "./utils/datasetParser";

interface CSVUploadProps {
  onPromptsExtracted: (prompts: string[]) => void;
  selectedDataset?: string;
}

export const CSVUpload = ({ onPromptsExtracted, selectedDataset }: CSVUploadProps) => {
  const loadDatasetContent = async (datasetId: string) => {
    if (!datasetId) return;

    try {
      console.log('Loading dataset content for:', datasetId);
      
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

      // Read and parse the file content
      const text = await fileData.text();
      const { headers, data } = parseCSVContent(text);
      
      const promptIndex = headers.findIndex(header => 
        header === "prompts" || header === "prompt" || header === "text"
      );

      if (promptIndex === -1) {
        toast.error("Dataset must have a 'prompts', 'prompt', or 'text' column");
        return;
      }

      const prompts = data.map(row => row[promptIndex]).filter(Boolean);

      if (prompts.length === 0) {
        toast.error("No valid prompts found in the dataset");
        return;
      }

      console.log(`Extracted ${prompts.length} prompts from dataset`);
      onPromptsExtracted(prompts);
      toast.success(`${prompts.length} prompts extracted from dataset`);

    } catch (error) {
      console.error("Dataset processing error:", error);
      toast.error("Error processing dataset: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  useEffect(() => {
    if (selectedDataset) {
      loadDatasetContent(selectedDataset);
    }
  }, [selectedDataset]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    try {
      const text = await file.text();
      const { headers, data } = parseCSVContent(text);
      
      const promptIndex = headers.findIndex(header => 
        header === "prompts" || header === "prompt" || header === "text"
      );

      if (promptIndex === -1) {
        toast.error("CSV must have a 'prompts', 'prompt', or 'text' column");
        return;
      }

      const prompts = data.map(row => row[promptIndex]).filter(Boolean);

      if (prompts.length === 0) {
        toast.error("No valid prompts found in the CSV file");
        return;
      }

      console.log(`Extracted ${prompts.length} prompts from uploaded file`);
      onPromptsExtracted(prompts);
      toast.success(`${prompts.length} prompts extracted successfully`);
      
      event.target.value = '';
    } catch (error) {
      console.error("CSV processing error:", error);
      toast.error("Error processing CSV file: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
};