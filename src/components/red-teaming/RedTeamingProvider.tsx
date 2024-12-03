import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface RedTeamingProviderProps {
  provider: string;
  onProviderChange: (value: string) => void;
}

export const RedTeamingProvider = ({
  provider,
  onProviderChange
}: RedTeamingProviderProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    onProviderChange("");
  };

  const handleModelChange = (model: string) => {
    onProviderChange(`${selectedProvider}-${model}`);
  };

  const getModelsForProvider = () => {
    switch (selectedProvider) {
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
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Provider</Label>
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedProvider && (
        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={provider.split('-')[1] || ""} onValueChange={handleModelChange}>
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
        </div>
      )}
    </div>
  );
};