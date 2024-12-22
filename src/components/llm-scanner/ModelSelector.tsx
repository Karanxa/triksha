import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DatasetSelector } from "./DatasetSelector";
import { ContextualConfig } from "./contextual-engine/types";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ModelSelectorProps {
  onStart: (config: ContextualConfig) => void;
}

export const ModelSelector = ({ onStart }: ModelSelectorProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [curlCommand, setCurlCommand] = useState("");
  const [placeholder, setPlaceholder] = useState("{PROMPT}");

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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Contextual Analysis</h3>
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
                  <SelectItem value="custom">Custom Provider</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedProvider === 'custom' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>cURL Command</Label>
                  <Textarea
                    placeholder="Enter your cURL command here"
                    value={curlCommand}
                    onChange={(e) => setCurlCommand(e.target.value)}
                    className="font-mono text-sm min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prompt Placeholder</Label>
                  <Input
                    placeholder="{PROMPT}"
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Replace the text in your cURL command that should be replaced with the prompt
                  </p>
                </div>
              </div>
            ) : selectedProvider && (
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
              selectedDataset={selectedDataset}
              onDatasetSelect={setSelectedDataset}
            />
          </div>

          <Button 
            onClick={() => onStart({
              provider: selectedProvider,
              model: selectedModel,
              datasetId: selectedDataset,
              customEndpoint: selectedProvider === 'custom' ? {
                curlCommand,
                placeholder
              } : undefined
            })}
            className="w-full"
            disabled={!selectedProvider || (!curlCommand && selectedProvider === 'custom') || (selectedProvider !== 'custom' && !selectedModel) || !selectedDataset}
          >
            Start Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};