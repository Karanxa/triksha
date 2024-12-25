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

// Updated to match database enum values
export const ATTACK_CATEGORIES = [
  "jailbreaking",
  "prompt-injection",
  "encoding-based", 
  "unsafe-prompts",
  "uncensored-prompts",
  "language-based-adversarial",
  "glitch-tokens",
  "llm-evasion",
  "system-prompt-leaking",
  "insecure-output"
] as const;

// Helper function to format category for display
const formatCategory = (category: string) => {
  return category
    .split('-')
    .map(word => {
      // Special handling for "LLM"
      if (word.toLowerCase() === "llm") {
        return "LLM";
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

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
              {formatCategory(category)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}