import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface LanguageSelectProps {
  value: string
  onValueChange: (value: string) => void
}

export const LanguageSelect = ({ value, onValueChange }: LanguageSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Script Language</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select script language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="python">Python</SelectItem>
          <SelectItem value="pytorch">PyTorch</SelectItem>
          <SelectItem value="tensorflow">TensorFlow</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}