import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  accept?: string;
}

export const FileUpload = ({ file, onFileSelect, accept }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 md:p-6 text-center transition-colors ${
        dragActive ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Input
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={accept}
        id="file-upload"
      />
      <Label
        htmlFor="file-upload"
        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {file ? (
          <span className="text-foreground break-all">{file.name}</span>
        ) : (
          <div className="space-y-2">
            <p className="font-medium">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">Supported formats: {accept || 'All files'}</p>
          </div>
        )}
      </Label>
    </div>
  );
};