import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ProviderSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const ProviderSelect = ({ value, onValueChange }: ProviderSelectProps) => {
  const [customModel, setCustomModel] = useState("");
  
  const handleProviderChange = (newValue: string) => {
    if (newValue === "custom") {
      // For custom provider, we'll use a custom model name format
      onValueChange(`${newValue}-${customModel}`);
    } else {
      onValueChange(newValue);
      setCustomModel("");
    }
  };

  const handleModelChange = (model: string) => {
    onValueChange(`${value.split('-')[0]}-${model}`);
  };

  const handleCustomModelChange = (modelName: string) => {
    setCustomModel(modelName);
    onValueChange(`custom-${modelName}`);
  };

  const getModelsForProvider = () => {
    const provider = value.split('-')[0];
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
      default:
        return [];
    }
  };

  const selectedProvider = value.split('-')[0];

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        Select AI Provider & Model
      </label>
      <div className="space-y-4">
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
            <SelectItem value="custom">Custom Provider</SelectItem>
          </SelectContent>
        </Select>

        {selectedProvider && selectedProvider !== "custom" && (
          <Select 
            value={value.split('-')[1] || ""} 
            onValueChange={handleModelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {getModelsForProvider().map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {selectedProvider === "custom" && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Enter Model Name
            </label>
            <Input
              placeholder="Enter your model name"
              value={customModel}
              onChange={(e) => handleCustomModelChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSelect;