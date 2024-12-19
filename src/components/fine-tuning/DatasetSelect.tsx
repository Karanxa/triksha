import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface DatasetSelectProps {
  datasetType: string
  setDatasetType: (value: string) => void
}

export const DatasetSelect = ({ datasetType, setDatasetType }: DatasetSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Dataset Type</Label>
      <Select value={datasetType} onValueChange={setDatasetType}>
        <SelectTrigger>
          <SelectValue placeholder="Select dataset type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="text">Text</SelectItem>
          <SelectItem value="conversation">Conversation</SelectItem>
          <SelectItem value="qa">Question & Answer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}