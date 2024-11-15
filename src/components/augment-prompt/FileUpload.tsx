import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileUpload: (prompts: string) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].toLowerCase().split(",");
      const promptIndex = headers.indexOf("prompts");

      if (promptIndex === -1) {
        toast.error("CSV must have a 'prompts' column");
        return;
      }

      const promptsList = lines
        .slice(1)
        .map(line => line.split(",")[promptIndex])
        .filter(Boolean)
        .join("\n");

      onFileUpload(promptsList);
      toast.success("CSV file uploaded successfully");
    };
    reader.readAsText(file);
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
      <p className="text-sm text-muted-foreground mb-4">
        Upload a CSV file with a 'prompts' column
      </p>
    </div>
  );
};

export default FileUpload;