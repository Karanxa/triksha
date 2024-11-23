import { useState } from "react";
import { Label } from "@/components/ui/label";
import { CustomEndpointInput } from "./providers/CustomEndpointInput";
import { ModelSelect } from "./providers/ModelSelect";
import { useForm } from "react-hook-form";

interface ScanFormProviderProps {
  provider: string;
  onProviderChange: (provider: string) => void;
  customEndpoint?: any;
  onCustomEndpointChange?: (endpoint: any) => void;
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
    if (value === 'custom') {
      onProviderChange('custom');
    }
  };

  const handleCustomEndpointChange = (endpoint: any) => {
    if (onCustomEndpointChange) {
      onCustomEndpointChange(endpoint);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Provider</Label>
        <CustomEndpointInput
          value={selectedProvider}
          onChange={handleProviderChange}
          inputType={inputType}
          onInputTypeChange={setInputType}
          endpoint={customEndpoint}
          onEndpointChange={handleCustomEndpointChange}
        />
      </div>
      {selectedProvider === 'custom' ? (
        <CustomEndpointInput
          value={customEndpoint}
          onChange={handleCustomEndpointChange}
          inputType={inputType}
          onInputTypeChange={setInputType}
        />
      ) : selectedProvider && (
        <ModelSelect 
          name="model"
          label="Model"
          placeholder="Select a model"
          control={form.control}
          provider={selectedProvider}
          onModelChange={(model) => onProviderChange(`${selectedProvider}-${model}`)}
        />
      )}
    </div>
  );
};