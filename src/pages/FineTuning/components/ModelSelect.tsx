import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ModelSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const ModelSelect = ({ value, onValueChange }: ModelSelectProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-white">Base Model</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="bg-white/5 border-white/10 text-white">
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