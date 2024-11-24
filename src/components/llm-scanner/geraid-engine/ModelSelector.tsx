import { useState } from "react";
import { Label } from "@/components/ui/label";
import { CustomEndpointInput } from "../../llm-scanner/providers/CustomEndpointInput";
import { ModelSelect } from "../../llm-scanner/providers/ModelSelect";
import { useForm, FormProvider } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomEndpoint } from "../types/CustomEndpoint";
import { DatasetSelector } from "./DatasetSelector";
import { Button } from "@/components/ui/button";

interface ModelSelectorProps {
  onStart: (config: { provider: string; model: string; datasetId: string; customEndpoint?: CustomEndpoint }) => void;
}

export const ModelSelector = ({ onStart }: ModelSelectorProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState<CustomEndpoint>({
    url: '',
    apiKey: '',
    headers: '',
    placeholder: '{PROMPT}',
    curlCommand: '',
    httpRequest: '',
    inputType: 'manual',
    method: 'POST'
  });

  const form = useForm({
    defaultValues: {
      model: "",
    }
  });

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    form.reset({ model: "" });
  };

  const handleCustomEndpointChange = (endpoint: Partial<CustomEndpoint>) => {
    setCustomEndpoint(prev => ({
      ...prev,
      ...endpoint
    }));
  };

  const handleStart = () => {
    const model = form.getValues('model');
    if (!selectedProvider || (!model && selectedProvider !== 'custom') || !selectedDataset) {
      return;
    }

    onStart({
      provider: selectedProvider,
      model: selectedProvider === 'custom' ? 'custom' : model,
      datasetId: selectedDataset,
      customEndpoint: selectedProvider === 'custom' ? customEndpoint : undefined
    });
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
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
              <SelectItem value="ollama">Ollama</SelectItem>
              <SelectItem value="custom">Custom Provider</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedProvider === 'custom' && (
          <CustomEndpointInput
            customEndpoint={customEndpoint}
            onCustomEndpointChange={handleCustomEndpointChange}
            inputType={customEndpoint.inputType}
            onInputTypeChange={(type) => handleCustomEndpointChange({ inputType: type })}
          />
        )}

        {selectedProvider && selectedProvider !== 'custom' && (
          <ModelSelect 
            name="model"
            label="Model"
            placeholder="Select a model"
            provider={selectedProvider}
            onModelChange={(model) => form.setValue('model', model)}
          />
        )}

        <DatasetSelector
          value={selectedDataset}
          onValueChange={setSelectedDataset}
        />

        <Button 
          onClick={handleStart}
          className="w-full"
          disabled={!selectedProvider || (!form.getValues('model') && selectedProvider !== 'custom') || !selectedDataset}
        >
          Start Analysis
        </Button>
      </div>
    </FormProvider>
  );
};