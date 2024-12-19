import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface TaskSelectProps {
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
          <SelectItem value="text-generation">Text Generation</SelectItem>
          <SelectItem value="text-classification">Text Classification</SelectItem>
          <SelectItem value="question-answering">Question Answering</SelectItem>
          <SelectItem value="summarization">Summarization</SelectItem>
          <SelectItem value="translation">Translation</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}