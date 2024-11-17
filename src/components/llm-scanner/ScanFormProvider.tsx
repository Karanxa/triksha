import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CustomEndpointInput } from "./providers/CustomEndpointInput";
import { ModelSelect } from "./providers/ModelSelect";

interface CustomEndpoint {
  url: string;
  apiKey: string;
  headers: string;
  placeholder: string;
  curlCommand: string;
  inputType: 'curl' | 'manual';
}

interface ScanFormProviderProps {
  provider: string;
  onProviderChange: (value: string) => void;
  customEndpoint: CustomEndpoint;
  onCustomEndpointChange: (endpoint: Partial<CustomEndpoint>) => void;
}

export const ScanFormProvider = ({ 
  provider, 
  onProviderChange,
  customEndpoint,
  onCustomEndpointChange
}: ScanFormProviderProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    onProviderChange("");
  };

  const handleModelChange = (model: string) => {
    onProviderChange(`${selectedProvider}-${model}`);
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

      {selectedProvider === 'ollama' ? (
        <CustomEndpointInput 
          customEndpoint={customEndpoint}
          onCustomEndpointChange={onCustomEndpointChange}
        />
      ) : selectedProvider && (
        <ModelSelect 
          provider={provider}
          selectedProvider={selectedProvider}
          onModelChange={handleModelChange}
        />
      )}
    </div>
  );
};