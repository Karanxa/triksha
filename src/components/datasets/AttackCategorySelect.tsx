import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

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
  const { toast } = useToast()

  const handleValueChange = async (newValue: string) => {
    try {
      onValueChange(newValue)
      
      const { error } = await supabase
        .from('datasets')
        .update({ 
          category: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', value) // Assuming value is the dataset ID

      if (error) throw error

      toast({
        title: "Category updated",
        description: "Dataset category has been updated successfully."
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating category",
        description: error.message
      })
    }
  }

  return (
    <div className="w-full">
      <Select value={value} onValueChange={handleValueChange}>
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