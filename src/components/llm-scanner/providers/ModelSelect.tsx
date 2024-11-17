import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModelSelectProps {
  provider: string;
  selectedProvider: string;
  onModelChange: (model: string) => void;
}

export const ModelSelect = ({ provider, selectedProvider, onModelChange }: ModelSelectProps) => {
  const getModelsForProvider = () => {
    switch (selectedProvider) {
      case "openai":
        return [
          { value: "gpt-4o", label: "GPT-4 Opus (Most Powerful)" },
          { value: "gpt-4o-mini", label: "GPT-4 Opus Mini (Fast)" },
          { value: "gpt-4-0125-preview", label: "GPT-4 Turbo Preview" },
          { value: "gpt-4-1106-preview", label: "GPT-4 Turbo (Legacy)" },
          { value: "gpt-4", label: "GPT-4 (Legacy)" },
          { value: "gpt-3.5-turbo-0125", label: "GPT-3.5 Turbo" },
          { value: "gpt-3.5-turbo-instruct", label: "GPT-3.5 Turbo Instruct" }
        ];
      case "anthropic":
        return [
          { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
          { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" }
        ];
      case "google":
        return [
          { value: "gemini-1.0-pro", label: "Gemini Pro" },
          { value: "gemini-1.0-ultra", label: "Gemini Ultra" }
        ];
      case "ollama":
        return [
          { value: "llama2", label: "Llama 2" },
          { value: "mistral", label: "Mistral" },
          { value: "codellama", label: "Code Llama" }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-2">
      <Label>Select Model</Label>
      <Select 
        value={provider.split('-')[1] || ""} 
        onValueChange={onModelChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {getModelsForProvider().map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};