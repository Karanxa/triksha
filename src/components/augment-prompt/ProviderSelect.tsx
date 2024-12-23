import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface ProviderSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const ProviderSelect = ({ value, onValueChange }: ProviderSelectProps) => {
  const [curlCommand, setCurlCommand] = useState("");
  const [placeholder, setPlaceholder] = useState("{PROMPT}");
  
  const handleProviderChange = (newValue: string) => {
    if (newValue === "custom") {
      onValueChange(`custom-${curlCommand}`);
    } else {
      onValueChange(newValue);
      setCurlCommand("");
    }
  };

  const handleModelChange = (model: string) => {
    onValueChange(`${value.split('-')[0]}-${model}`);
  };

  const handleCurlCommandChange = (command: string) => {
    setCurlCommand(command);
    onValueChange(`custom-${command}`);
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
            <SelectItem value="custom">Custom Endpoint</SelectItem>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>cURL Command</Label>
              <Textarea
                placeholder="Enter your cURL command here"
                value={curlCommand}
                onChange={(e) => handleCurlCommandChange(e.target.value)}
                className="font-mono text-sm min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Prompt Placeholder</Label>
              <Input
                placeholder="{PROMPT}"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Replace the text in your cURL command that should be replaced with the prompt
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSelect;