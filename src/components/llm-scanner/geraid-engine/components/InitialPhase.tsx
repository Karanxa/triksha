import { ModelSelector } from "../ModelSelector";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomEndpoint } from "../../types/CustomEndpoint";

interface InitialPhaseProps {
  onStart: (config: { provider: string; model: string; datasetId: string; customEndpoint?: CustomEndpoint }) => void;
}

export const InitialPhase = ({ onStart }: InitialPhaseProps) => {
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [customEndpoint, setCustomEndpoint] = useState<CustomEndpoint>({
    url: '',
    apiKey: '',
    headers: '',
    placeholder: '{PROMPT}',
    curlCommand: '',
    inputType: 'manual',
    method: 'POST'
  });

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
      datasetId: selectedDataset,
      customEndpoint: provider === 'custom' ? customEndpoint : undefined
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <ModelSelector
          provider={provider}
          model={model}
          onProviderChange={setProvider}
          onModelChange={setModel}
          customEndpoint={customEndpoint}
          onCustomEndpointChange={(endpoint) => setCustomEndpoint(prev => ({ ...prev, ...endpoint }))}
        />

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
        disabled={!provider || (!model && provider !== 'custom') || !selectedDataset}
      >
        Start Analysis
      </Button>
    </div>
  );
};