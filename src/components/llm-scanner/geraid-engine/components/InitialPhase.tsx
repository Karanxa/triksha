import { ModelSelector } from "../ModelSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface InitialPhaseProps {
  onStart: (config: { provider: string; model: string; datasetId: string }) => void;
}

export const InitialPhase = ({ onStart }: InitialPhaseProps) => {
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");

  const { data: datasets, isLoading: isLoadingDatasets } = useQuery({
    queryKey: ['user-datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to fetch datasets");
        return [];
      }
      return data;
    }
  });

  const handleStart = () => {
    if (!selectedDataset) {
      toast.error("Please select a dataset");
      return;
    }

    onStart({
      provider,
      model,
      datasetId: selectedDataset
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-full">
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

        {provider && (
          <ModelSelector
            provider={provider}
            model={model}
            onProviderChange={setProvider}
            onModelChange={setModel}
          />
        )}

        <div className="space-y-2">
          <Label>Dataset</Label>
          {isLoadingDatasets ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading datasets...</span>
            </div>
          ) : (
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger>
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets?.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Button 
        onClick={handleStart}
        className="w-full"
        disabled={!provider || !model || !selectedDataset}
      >
        Start Analysis
      </Button>
    </div>
  );
};