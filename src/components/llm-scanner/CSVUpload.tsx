import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      const lines = text.trim().split('\n');
      const headers = lines[0].toLowerCase().split(',');
      
      const promptIndex = headers.findIndex(header => 
        header === "prompts" || header === "prompt" || header === "text"
      );

      if (promptIndex === -1) {
        toast.error("CSV must have a 'prompts', 'prompt', or 'text' column");
        return;
      }

      const prompts = lines.slice(1)
        .map(line => {
          const values = line.split(',');
          return values[promptIndex]?.trim().replace(/^"|"$/g, '') || '';
        })
        .filter(Boolean);

      if (prompts.length === 0) {
        toast.error("No valid prompts found in the CSV file");
        return;
      }

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
          size="lg"
          className="w-full flex items-center gap-2"
          onClick={() => document.getElementById("csv-upload-scanner")?.click()}
        >
          <Upload className="w-4 h-4" />
          Upload CSV File
        </Button>
      </div>
      <input
        id="csv-upload-scanner"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileUpload}
      />
      <Alert>
        <AlertDescription>
          Upload a CSV file with a 'prompts' column. Each row should contain one prompt for testing.
        </AlertDescription>
      </Alert>
    </div>
  );
};