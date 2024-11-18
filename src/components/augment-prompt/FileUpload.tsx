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
      // For large files, use FileReader with chunks
      const chunkSize = 1024 * 1024; // 1MB chunks
      const fileSize = file.size;
      let offset = 0;
      let prompts: string[] = [];
      let headerProcessed = false;
      let promptIndex = -1;

      const processChunk = async (chunk: string) => {
        const lines = chunk.split(/\r?\n/);
        
        if (!headerProcessed && lines.length > 0) {
          const headers = lines[0].toLowerCase().split(",").map(header => header.trim());
          promptIndex = headers.findIndex(header => 
            header === "prompts" || header === "prompt" || header === "text"
          );
          
          if (promptIndex === -1) {
            throw new Error("CSV must have a 'prompts', 'prompt', or 'text' column");
          }
          
          headerProcessed = true;
          lines.shift(); // Remove header line
        }

        const validPrompts = lines
          .map(line => {
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const cleanedValues = values.map(val => val.replace(/^"|"$/g, '').trim());
            return cleanedValues[promptIndex];
          })
          .filter(Boolean);

        prompts.push(...validPrompts);
      };

      const readNextChunk = () => {
        const reader = new FileReader();
        const blob = file.slice(offset, offset + chunkSize);
        
        reader.onload = async (e) => {
          const chunk = e.target?.result as string;
          await processChunk(chunk);
          
          offset += chunkSize;
          const progress = Math.min(100, Math.round((offset / fileSize) * 100));
          
          if (offset < fileSize) {
            // Show progress for large files
            toast.info(`Processing file... ${progress}%`, { id: 'csv-progress' });
            readNextChunk();
          } else {
            // Processing complete
            if (prompts.length === 0) {
              toast.error("No valid prompts found in the CSV file");
              return;
            }

            onFileUpload(prompts.join("\n"));
            toast.success(`${prompts.length.toLocaleString()} prompts loaded successfully`);
          }
        };

        reader.onerror = () => {
          toast.error("Error reading file");
        };

        reader.readAsText(blob);
      };

      readNextChunk();
    } catch (error) {
      console.error("CSV processing error:", error);
      toast.error("Error processing CSV file: " + (error as Error).message);
    } finally {
      // Reset input
      event.target.value = '';
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
          CSV files are processed in chunks to handle large datasets efficiently. Progress will be shown for large files.
        </AlertDescription>
      </Alert>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a CSV file with a 'prompts' column
      </p>
    </div>
  );
};

export default FileUpload;