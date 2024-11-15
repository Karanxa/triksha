import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface CSVUploadProps {
  onPromptsExtracted: (prompts: string) => void;
}

export const CSVUpload = ({ onPromptsExtracted }: CSVUploadProps) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check both MIME type and file extension
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
      
      if (lines.length === 0) {
        toast.error("CSV file is empty");
        return;
      }

      const headers = lines[0].toLowerCase().split(",").map(header => header.trim());
      const promptIndex = headers.indexOf("prompts");

      if (promptIndex === -1) {
        toast.error("CSV must have a 'prompts' column");
        return;
      }

      const prompts = lines
        .slice(1)
        .map(line => {
          const columns = line.split(",").map(col => col.trim());
          return columns[promptIndex];
        })
        .filter(Boolean)
        .join("\n");

      if (!prompts) {
        toast.error("No valid prompts found in the CSV file");
        return;
      }

      onPromptsExtracted(prompts);
      toast.success("CSV file processed successfully");
      
      // Reset the input
      event.target.value = '';
    } catch (error) {
      console.error("CSV processing error:", error);
      toast.error("Error processing CSV file: " + (error as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Upload CSV</label>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
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