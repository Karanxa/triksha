import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatasetSelector } from "./DatasetSelector";
import { ProviderModel, GeraidConfig } from "./types";

interface ModelSelectorProps {
  onStart: (config: GeraidConfig) => void;
}

export const ModelSelector = ({ onStart }: ModelSelectorProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");

  const getModelsForProvider = (provider: string): ProviderModel[] => {
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
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Geraid-Engine</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select a target model and dataset to begin. This will help understand the model's capabilities and test it against your dataset.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select 
                value={selectedProvider} 
                onValueChange={(value) => {
                  setSelectedProvider(value);
                  setSelectedModel(""); // Reset model when provider changes
                }}
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

            {selectedProvider && (
              <div className="space-y-2">
                <Label>Model</Label>
                <Select 
                  value={selectedModel} 
                  onValueChange={setSelectedModel}
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

            <DatasetSelector 
              value={selectedDataset}
              onValueChange={setSelectedDataset}
            />
          </div>

          <Button 
            onClick={() => onStart({
              provider: selectedProvider,
              model: selectedModel,
              datasetId: selectedDataset
            })}
            className="w-full"
            disabled={!selectedProvider || !selectedModel || !selectedDataset}
          >
            Start Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};