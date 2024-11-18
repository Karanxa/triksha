import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import CustomEndpointInput from "./CustomEndpointInput";
import ModelSelect from "./providers/ModelSelect";

interface ScanFormProviderProps {
  provider: string;
  onProviderChange: (value: string) => void;
  customEndpoint: any;
  onCustomEndpointChange: (endpoint: any) => void;
}

type InputType = "manual" | "batch";

export const ScanFormProvider = ({
  provider,
  onProviderChange,
  customEndpoint,
  onCustomEndpointChange,
}: ScanFormProviderProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [inputType, setInputType] = useState<InputType>("manual");

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    // Reset the full provider value when changing main provider
    onProviderChange("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Provider</Label>
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="google">Google AI</SelectItem>
            <SelectItem value="ollama">Ollama (Custom Endpoint)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedProvider === "ollama" ? (
        <CustomEndpointInput
          customEndpoint={customEndpoint}
          onCustomEndpointChange={onCustomEndpointChange}
          inputType={inputType}
          onInputTypeChange={setInputType}
        />
      ) : selectedProvider && (
        <ModelSelect 
          provider={selectedProvider}
          onModelChange={(model) => onProviderChange(`${selectedProvider}-${model}`)}
        />
      )}
    </div>
  );
};
