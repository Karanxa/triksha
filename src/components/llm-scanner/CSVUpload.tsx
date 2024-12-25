import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

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
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      const headers = lines[0].toLowerCase().split(',');
      const promptIndex = headers.findIndex(h => 
        h === 'prompt' || h === 'text' || h === 'content'
      );

      if (promptIndex === -1) {
        toast.error('CSV must have a prompt, text, or content column');
        return;
      }

      const prompts = lines.slice(1)
        .map(line => {
          const values = line.split(',');
          return values[promptIndex]?.trim() || '';
        })
        .filter(Boolean);

      if (prompts.length === 0) {
        toast.error("No valid prompts found in the CSV file");
        return;
      }

      onPromptsExtracted(prompts);
      toast.success(`${prompts.length.toLocaleString()} prompts loaded successfully`);
    } catch (error) {
      console.error("CSV processing error:", error);
      toast.error("Error processing CSV file: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => document.getElementById("csv-upload-scanner")?.click()}
        >
          <Upload className="w-4 h-4" />
          Upload CSV
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a CSV file with a 'prompt' or 'text' column
        </p>
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
          Your CSV file should have a column named 'prompt', 'text', or 'content' containing the prompts.
        </AlertDescription>
      </Alert>
    </div>
  );
};