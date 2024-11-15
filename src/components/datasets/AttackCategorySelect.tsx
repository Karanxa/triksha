import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AttackCategorySelectProps {
  value: string
  onValueChange: (value: string) => void
}

const ATTACK_CATEGORIES = [
  "Jailbreaking",
  "Prompt Injection",
  "Data Extraction",
  "Prompt Leaking",
  "Social Engineering",
  "System Prompt Extraction",
  "Unauthorized Actions",
  "Model Behavior Manipulation",
  "Resource Exhaustion",
  "Sensitive Information Disclosure"
] as const;

export const AttackCategorySelect = ({
  value,
  onValueChange,
}: AttackCategorySelectProps) => {
  return (
    <div className="w-full">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Attack Category" />
        </SelectTrigger>
        <SelectContent>
          {ATTACK_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}