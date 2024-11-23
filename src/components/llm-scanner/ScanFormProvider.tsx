import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CustomEndpointInput } from "./providers/CustomEndpointInput";
import { ModelSelect } from "./providers/ModelSelect";
import { useForm } from "react-hook-form";

interface ScanFormProviderProps {
  provider: string;
  onProviderChange: (value: string) => void;
  customEndpoint: any;
  onCustomEndpointChange: (endpoint: any) => void;
}

export const ScanFormProvider = ({
  provider,
  onProviderChange,
  customEndpoint,
  onCustomEndpointChange,
}: ScanFormProviderProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [inputType, setInputType] = useState<'curl' | 'manual' | 'http'>("manual");
  const form = useForm();

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
          name="model"
          label="Model"
          placeholder="Select a model"
          control={form.control}
        />
      )}
    </div>
  );
};