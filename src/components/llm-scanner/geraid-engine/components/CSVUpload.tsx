import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CSVUploadProps {
  onFileUpload: (prompts: string[]) => void;
}

export const CSVUpload = ({ onFileUpload }: CSVUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      console.log('Processing file:', file.name); // Debug log

      if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }

      const text = await file.text();
      console.log('File content length:', text.length); // Debug log

      const lines = text.split(/\r?\n/).filter(line => line.trim());
      console.log('Number of lines:', lines.length); // Debug log
      
      if (lines.length === 0) {
        throw new Error("CSV file is empty");
      }

      const headers = lines[0].toLowerCase().split(",").map(header => header.trim());
      console.log('CSV headers:', headers); // Debug log

      const promptIndex = headers.findIndex(header => 
        header === "prompts" || header === "prompt" || header === "text" || header === "original_prompt"
      );

      if (promptIndex === -1) {
        throw new Error("CSV must have a 'prompts', 'prompt', 'text', or 'original_prompt' column");
      }

      const prompts = lines.slice(1).map(line => {
        // Handle quoted values containing commas
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const cleanedValues = values.map(val => val.replace(/^"|"$/g, '').trim());
        return cleanedValues[promptIndex];
      }).filter(Boolean);

      console.log('Extracted prompts:', prompts.length); // Debug log

      if (prompts.length === 0) {
        throw new Error("No valid prompts found in the CSV file");
      }

      onFileUpload(prompts);
      toast.success(`${prompts.length} prompts loaded successfully`);
      event.target.value = '';
    } catch (error) {
      console.error("CSV processing error:", error);
      toast.error(error instanceof Error ? error.message : "Error processing CSV file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 w-full"
          onClick={() => document.getElementById("geraide-csv-upload")?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? "Processing..." : "Upload CSV"}
        </Button>
      </div>
      <input
        id="geraide-csv-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      <Alert>
        <AlertDescription>
          Upload a CSV file with a 'prompts' column. The file will be processed and the prompts will be extracted automatically.
        </AlertDescription>
      </Alert>
    </div>
  );
};