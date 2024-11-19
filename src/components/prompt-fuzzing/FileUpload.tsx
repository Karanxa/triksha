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
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        dragActive ? "border-primary" : "border-muted"
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
        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
      >
        {file ? (
          <span className="text-foreground">{file.name}</span>
        ) : (
          <>
            <span className="font-semibold">Click to upload</span> or drag and drop
          </>
        )}
      </Label>
    </div>
  );
};