import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadProps {
  onFileUpload: (prompts: string) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check both MIME type and file extension for better compatibility
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

      // Add warning for large files
      if (prompts.length > 10000) {
        toast.warning(`Processing ${prompts.length.toLocaleString()} prompts may take some time. The system will provide real-time progress updates.`);
      }

      onFileUpload(prompts.join("\n"));
      toast.success(`${prompts.length.toLocaleString()} prompts loaded successfully`);
      
      // Reset input
      event.target.value = '';
    } catch (error) {
      console.error("CSV processing error:", error);
      toast.error("Error processing CSV file: " + (error as Error).message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium">Upload CSV</label>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => document.getElementById("csv-upload")?.click()}
        >
          <Upload className="w-4 h-4" />
          Upload CSV
        </Button>
      </div>
      <input
        id="csv-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileUpload}
      />
      <Alert className="mt-2">
        <AlertDescription>
          You can upload CSV files containing up to 100,000 prompts. For large files, progress will be shown in real-time.
        </AlertDescription>
      </Alert>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a CSV file with a 'prompts' column
      </p>
    </div>
  );
};

export default FileUpload;