import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ModelSelectProps {
  model: string
  setModel: (value: string) => void
}

export const ModelSelect = ({ model, setModel }: ModelSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Base Model</Label>
      <Select value={model} onValueChange={setModel}>
        <SelectTrigger>
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-4o">GPT-4 Opus</SelectItem>
          <SelectItem value="gpt-4o-mini">GPT-4 Opus Mini</SelectItem>
          <SelectItem value="llama2">Llama 2</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}