import { useState } from "react";
import { Label } from "@/components/ui/label";
import { CustomEndpointInput } from "./providers/CustomEndpointInput";
import { ModelSelect } from "./providers/ModelSelect";
import { useForm, FormProvider } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const form = useForm({
    defaultValues: {
      model: "",
    }
  });

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    onProviderChange(value);
    // Reset model when provider changes
    form.reset({ model: "" });
  };

  const handleCustomEndpointChange = (endpoint: any) => {
    if (onCustomEndpointChange) {
      onCustomEndpointChange(endpoint);
    }
  };

  return (
    <FormProvider {...form}>
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
              <SelectItem value="google">Google AI</SelectItem>
              <SelectItem value="custom">Custom Endpoint</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedProvider === 'custom' && (
          <CustomEndpointInput
            customEndpoint={customEndpoint}
            onCustomEndpointChange={handleCustomEndpointChange}
            inputType={inputType}
            onInputTypeChange={setInputType}
          />
        )}

        {selectedProvider && selectedProvider !== 'custom' && (
          <ModelSelect 
            name="model"
            label="Model"
            placeholder="Select a model"
            provider={selectedProvider}
            onModelChange={(model) => onProviderChange(`${selectedProvider}-${model}`)}
          />
        )}
      </div>
    </FormProvider>
  );
};