import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface DatasetUploadProps {
  onFileSelect: (file: File) => void
}

export const DatasetUpload = ({ onFileSelect }: DatasetUploadProps) => {
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase()
      if (['json', 'jsonl', 'csv', 'txt'].includes(fileType || '')) {
        onFileSelect(file)
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a JSON, JSONL, CSV, or TXT file",
        })
      }
    }
  }

  return (
    <div className="space-y-2">
      <Label>Upload Dataset</Label>
      <Input
        type="file"
        accept=".json,.jsonl,.csv,.txt"
        onChange={handleFileChange}
        className="cursor-pointer"
      />
      <p className="text-sm text-muted-foreground">
        Supported formats: JSON, JSONL, CSV, TXT
      </p>
    </div>
  )
}