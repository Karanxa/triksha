import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TaskSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const TaskSelect = ({ value, onValueChange }: TaskSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Task Type</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select task type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="classification">Classification</SelectItem>
          <SelectItem value="generation">Text Generation</SelectItem>
          <SelectItem value="completion">Completion</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}