import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dataset } from "@/types/dataset";
import { cn } from "@/lib/utils";
import { CSVUpload } from "../CSVUpload";
import { ContextualConfig } from "./types";

interface ModelSelectorProps {
  onStart: (config: ContextualConfig) => void;
}

export const ModelSelector = ({ onStart }: ModelSelectorProps) => {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);

  const { data: datasets, isLoading } = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("datasets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Dataset[];
    },
  });

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

            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="datasets" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="datasets" className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Existing Datasets
                    </TabsTrigger>
                    <TabsTrigger value="csv" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Upload CSV
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="datasets" className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Select Dataset</Label>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {isLoading ? (
                          <div className="text-center text-muted-foreground col-span-full">Loading datasets...</div>
                        ) : datasets?.length === 0 ? (
                          <div className="text-center text-muted-foreground col-span-full">No datasets found</div>
                        ) : (
                          datasets?.map((dataset) => (
                            <div
                              key={dataset.id}
                              onClick={() => setSelectedDataset(dataset)}
                              className={cn(
                                "group p-4 border rounded-lg cursor-pointer transition-all duration-200",
                                "hover:shadow-md hover:border-primary/50",
                                "flex flex-col justify-between min-h-[120px]",
                                selectedDataset?.id === dataset.id
                                  ? "border-primary bg-primary/5"
                                  : "border-border"
                              )}
                            >
                              <div className="space-y-1">
                                <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                                  {dataset.name}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {dataset.description || "No description provided"}
                                </p>
                              </div>
                              <div className="text-sm font-medium text-muted-foreground mt-2">
                                {dataset.metadata?.promptCount || 0} prompts
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="csv">
                    <CSVUpload onPromptsExtracted={setPrompts} />
                    {prompts.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {prompts.length.toLocaleString()} prompts loaded from CSV
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <Button 
            onClick={() => onStart({
              provider: selectedProvider,
              model: selectedModel,
              datasetId: selectedDataset?.id || "",
              customEndpoint: undefined
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