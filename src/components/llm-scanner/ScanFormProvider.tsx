import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

interface ScanFormProviderProps {
  provider: string;
  onProviderChange: (value: string) => void;
  customEndpoint?: {
    url: string;
    apiKey: string;
    headers: string;
    placeholder: string;
    curlCommand?: string;
    inputType?: 'curl' | 'manual';
  };
  onCustomEndpointChange?: (endpoint: {
    url: string;
    apiKey: string;
    headers: string;
    placeholder: string;
    curlCommand?: string;
    inputType?: 'curl' | 'manual';
  }) => void;
}

export const ScanFormProvider = ({ 
  provider, 
  onProviderChange,
  customEndpoint = { 
    url: '', 
    apiKey: '', 
    headers: '', 
    placeholder: '{PROMPT}',
    curlCommand: '',
    inputType: 'manual'
  },
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

  const handleCustomEndpointChange = (field: keyof typeof customEndpoint, value: string) => {
    if (onCustomEndpointChange) {
      onCustomEndpointChange({
        ...customEndpoint,
        [field]: value
      });
    }
  };

  const handleInputTypeChange = (value: 'curl' | 'manual') => {
    if (onCustomEndpointChange) {
      onCustomEndpointChange({
        ...customEndpoint,
        inputType: value,
        // Reset fields when switching input type
        url: '',
        apiKey: '',
        headers: '',
        curlCommand: '',
        placeholder: '{PROMPT}'
      });
    }
  };

  const getModelsForProvider = () => {
    switch (selectedProvider) {
      case "openai":
        return [
          { value: "gpt4o", label: "GPT-4 Optimized" },
          { value: "gpt4o-mini", label: "GPT-4 Mini" }
        ];
      case "anthropic":
        return [
          { value: "claude3", label: "Claude 3" },
          { value: "claude2", label: "Claude 2" }
        ];
      case "google":
        return [
          { value: "gemini-pro", label: "Gemini Pro" },
          { value: "gemini-ultra", label: "Gemini Ultra" }
        ];
      case "ollama":
        return [
          { value: "llama2", label: "Llama 2" },
          { value: "mistral", label: "Mistral" },
          { value: "codellama", label: "Code Llama" }
        ];
      default:
        return [];
    }
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
            <SelectItem value="custom">Custom Endpoint</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedProvider === 'custom' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Input Method</Label>
            <RadioGroup
              value={customEndpoint.inputType}
              onValueChange={(value: 'curl' | 'manual') => handleInputTypeChange(value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="curl" id="curl" />
                <Label htmlFor="curl">cURL Command</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">Manual Configuration</Label>
              </div>
            </RadioGroup>
          </div>

          {customEndpoint.inputType === 'curl' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>cURL Command</Label>
                <Textarea
                  placeholder="Enter your cURL command here"
                  value={customEndpoint.curlCommand}
                  onChange={(e) => handleCustomEndpointChange('curlCommand', e.target.value)}
                  className="font-mono text-sm min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Prompt Placeholder</Label>
                <Input
                  placeholder="{PROMPT}"
                  value={customEndpoint.placeholder}
                  onChange={(e) => handleCustomEndpointChange('placeholder', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Replace the text in your cURL command that should be replaced with the prompt
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Custom Endpoint URL</Label>
                <Input
                  placeholder="https://your-custom-endpoint.com"
                  value={customEndpoint.url}
                  onChange={(e) => handleCustomEndpointChange('url', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Custom API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter your custom API key"
                  value={customEndpoint.apiKey}
                  onChange={(e) => handleCustomEndpointChange('apiKey', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Custom Headers (Optional JSON)</Label>
                <Textarea
                  placeholder='{"Authorization": "Bearer your-token"}'
                  value={customEndpoint.headers}
                  onChange={(e) => handleCustomEndpointChange('headers', e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Prompt Placeholder</Label>
                <Input
                  placeholder="{PROMPT}"
                  value={customEndpoint.placeholder}
                  onChange={(e) => handleCustomEndpointChange('placeholder', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Specify where to insert the prompt in your request
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedProvider && selectedProvider !== 'custom' && (
        <div className="space-y-2">
          <Label>Select Model</Label>
          <Select 
            value={provider.split('-')[1] || ""} 
            onValueChange={handleModelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
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