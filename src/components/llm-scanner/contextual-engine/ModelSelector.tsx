import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { OllamaConfig } from "../providers/OllamaConfig";
import { DatasetSelector } from "./DatasetSelector";

interface ModelSelectorProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onStart: () => void;
}

export const ModelSelector = ({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  onStart
}: ModelSelectorProps) => {
  const [showOllamaConfig, setShowOllamaConfig] = useState(false);
  const [ollamaConfig, setOllamaConfig] = useState<any>(null);
  const [selectedDataset, setSelectedDataset] = useState("");

  const getModelsForProvider = (provider: string) => {
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

  const handleProviderSelect = (value: string) => {
    onProviderChange(value);
    if (value === "ollama") {
      setShowOllamaConfig(true);
    } else {
      setShowOllamaConfig(false);
      onModelChange("");
    }
  };

  const handleOllamaConfig = (config: any) => {
    setOllamaConfig(config);
    onModelChange(config.modelName);
    setShowOllamaConfig(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Contextual Model Analysis</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a target model to begin the analysis process. This will help understand the model's capabilities, limitations, and security boundaries.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select 
                value={selectedProvider} 
                onValueChange={handleProviderSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="google">Google AI</SelectItem>
                  <SelectItem value="ollama">Ollama</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedProvider && selectedProvider !== "ollama" && (
              <div className="space-y-2">
                <Label>Model</Label>
                <Select 
                  value={selectedModel} 
                  onValueChange={onModelChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModelsForProvider(selectedProvider).map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showOllamaConfig && (
              <OllamaConfig onConfigComplete={handleOllamaConfig} />
            )}

            {selectedProvider && selectedModel && !showOllamaConfig && (
              <DatasetSelector 
                selectedDataset={selectedDataset}
                onDatasetSelect={setSelectedDataset}
              />
            )}
          </div>

          {selectedProvider && selectedModel && selectedDataset && !showOllamaConfig && (
            <Button 
              onClick={onStart}
              className="w-full"
            >
              Start Analysis
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};