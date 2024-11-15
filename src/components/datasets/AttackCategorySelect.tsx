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
  "Prompt Injection",
  "Encoding Based",
  "Unsafe Prompts",
  "Uncensored Prompts",
  "Language Based Adversial Prompts",
  "Glitch Tokens",
  "LLM Evasion",
  "Leaking System Prompts",
  "Insecure Output Handling",
  "Jail Breaking"
] as const

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
            <SelectItem 
              key={category.toLowerCase().replace(/\s+/g, '-')} 
              value={category.toLowerCase().replace(/\s+/g, '-')}
            >
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}