import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TaskSelectProps {
  taskType: string
  setTaskType: (value: string) => void
}

export const TaskSelect = ({ taskType, setTaskType }: TaskSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="task-type">Task Type</Label>
      <Select value={taskType} onValueChange={setTaskType}>
        <SelectTrigger id="task-type">
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