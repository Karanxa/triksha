import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface ScanFormProviderProps {
  provider: string;
  onProviderChange: (value: string) => void;
  customEndpoint?: {
    url: string;
    apiKey: string;
    headers: string;
    placeholder: string;
  };
  onCustomEndpointChange?: (endpoint: {
    url: string;
    apiKey: string;
    headers: string;
    placeholder: string;
  }) => void;
}

export const ScanFormProvider = ({ 
  provider, 
  onProviderChange,
  customEndpoint = { url: '', apiKey: '', headers: '', placeholder: '{PROMPT}' },
  onCustomEndpointChange
}: ScanFormProviderProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");

  const handleProviderChange = (value: string) => {
    setSelectedProvider(value);
    // Reset the full provider value when changing main provider
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

      {selectedProvider === 'custom' ? (
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
              Specify the exact placeholder text used in your cURL command
            </p>
          </div>
        </div>
      ) : selectedProvider && (
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