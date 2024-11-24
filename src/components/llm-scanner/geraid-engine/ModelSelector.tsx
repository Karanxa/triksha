import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModelSelectorProps {
  provider: string;
  model: string;
  onProviderChange: (value: string) => void;
  onModelChange: (value: string) => void;
}

export const ModelSelector = ({ 
  provider, 
  model, 
  onProviderChange, 
  onModelChange 
}: ModelSelectorProps) => {
  const getModelsForProvider = (provider: string) => {
    switch (provider) {
      case "openai":
        return [
          { value: "gpt-4o", label: "GPT-4 Opus" },
          { value: "gpt-4o-mini", label: "GPT-4 Opus Mini" }
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Provider</Label>
        <Select 
          value={provider} 
          onValueChange={(value) => {
            onProviderChange(value);
            onModelChange(""); // Reset model when provider changes
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
            <SelectItem value="ollama">Ollama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {provider && (
        <div className="space-y-2">
          <Label>Model</Label>
          <Select 
            value={model} 
            onValueChange={onModelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {getModelsForProvider(provider).map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};