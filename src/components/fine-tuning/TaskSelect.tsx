import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TaskSelectProps {
  value: string
  onChange: (value: string) => void
}

export const TaskSelect = ({ value, onChange }: TaskSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Task Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a task type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="classification">Classification</SelectItem>
          <SelectItem value="generation">Generation</SelectItem>
          <SelectItem value="completion">Completion</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}