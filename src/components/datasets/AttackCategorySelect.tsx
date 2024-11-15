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
  {
    label: "Jail Breaking",
    value: "jail-breaking",
    subCategories: [
      "Prompt Injection",
      "Encoding Based",
      "Unsafe Prompts",
      "Uncensored Prompts",
      "Language Based Adversial Prompts",
      "Glitch Tokens",
      "LLM Evasion",
      "Leaking System Prompts",
      "Insecure Output Handling"
    ]
  }
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
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
          {value === "jail-breaking" && ATTACK_CATEGORIES[0].subCategories.map((subCategory) => (
            <SelectItem 
              key={subCategory.toLowerCase().replace(/\s+/g, '-')} 
              value={subCategory.toLowerCase().replace(/\s+/g, '-')}
              className="pl-6"
            >
              {subCategory}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}