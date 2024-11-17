import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface DatasetUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
}

export const DatasetUpload = ({ file, onFileChange }: DatasetUploadProps) => {
  const { toast } = useToast()
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    validateAndSetFile(files[0])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      validateAndSetFile(files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    const validTypes = ['text/csv', 'application/json', 'text/plain']
    const maxSize = 50 * 1024 * 1024 // 50MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV, JSON, or TXT file",
        variant: "destructive"
      })
      return
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive"
      })
      return
    }

    onFileChange(file)
  }

  return (
    <div className="space-y-2">
      <Label>Dataset</Label>
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
          onChange={handleChange}
          accept=".csv,.json,.txt,.jsonl"
          className="hidden"
          id="dataset-upload"
        />
        <Label
          htmlFor="dataset-upload"
          className="cursor-pointer text-sm text-muted-foreground"
        >
          {file ? file.name : "Drop your dataset here or click to browse"}
        </Label>
      </div>
    </div>
  )
}