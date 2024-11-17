import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModelSelectProps {
  value: string
  onChange: (value: string) => void
}

export const ModelSelect = ({ value, onChange }: ModelSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
          <SelectItem value="llama2-7b">LLaMA 2 7B</SelectItem>
          <SelectItem value="llama2-13b">LLaMA 2 13B</SelectItem>
          <SelectItem value="mistral-7b">Mistral 7B</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}