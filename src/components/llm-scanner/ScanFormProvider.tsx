import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ScanFormProviderProps {
  provider: string;
  onProviderChange: (value: string) => void;
}

export const ScanFormProvider = ({ provider, onProviderChange }: ScanFormProviderProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    // Reset the full provider value when changing main provider
    onProviderChange("");
  };

  const handleModelChange = (model: string) => {
    onProviderChange(`${selectedProvider}-${model}`);
  };

  const getModelsForProvider = () => {
    switch (selectedProvider) {
      case "openai":
        return [
          { value: "gpt4o", label: "GPT-4 Optimized" },
          { value: "gpt4o-mini", label: "GPT-4 Mini" }
        ];
      case "anthropic":
        return [
          { value: "claude3", label: "Claude 3" },
          { value: "claude2", label: "Claude 2" }
        ];
      case "google":
        return [
          { value: "gemini-pro", label: "Gemini Pro" },
          { value: "gemini-ultra", label: "Gemini Ultra" }
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
        <Label>Select Provider</Label>
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
            <SelectItem value="ollama">Ollama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedProvider && (
        <div className="space-y-2">
          <Label>Select Model</Label>
          <Select 
            value={provider.split('-')[1] || ""} 
            onValueChange={handleModelChange}
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
      )}
    </div>
  );
};