import { useState } from "react";
import { ProviderSelect } from "./provider/ProviderSelect";
import { ModelSelect } from "./provider/ModelSelect";
import { getModelsForProvider } from "./provider/getModelsForProvider";
import { ScanFormCustomEndpoint } from "./ScanFormCustomEndpoint";

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
      <ProviderSelect 
        selectedProvider={selectedProvider} 
        onProviderChange={handleProviderChange}
      />

      {selectedProvider === 'custom' && (
        <ScanFormCustomEndpoint
          customEndpoint={customEndpoint}
          onCustomEndpointChange={onCustomEndpointChange}
        />
      )}

      {selectedProvider && selectedProvider !== 'custom' && (
        <ModelSelect
          models={getModelsForProvider(selectedProvider)}
          selectedModel={provider.split('-')[1] || ""}
          onModelChange={handleModelChange}
        />
      )}
    </div>
  );
};