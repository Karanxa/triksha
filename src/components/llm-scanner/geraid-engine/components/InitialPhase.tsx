import { ModelSelector } from "../ModelSelector";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomEndpoint } from "../../types/CustomEndpoint";
import { CSVUpload } from "./CSVUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InitialPhaseProps {
  onStart: (config: { provider: string; model: string; datasetId: string; customEndpoint?: CustomEndpoint }) => void;
}

export const InitialPhase = ({ onStart }: InitialPhaseProps) => {
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [datasetSource, setDatasetSource] = useState<"select" | "upload">("select");
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

    if (!provider || (!model && provider !== 'custom')) {
      toast.error("Please select a provider and model");
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
          <Tabs value={datasetSource} onValueChange={(v) => setDatasetSource(v as "select" | "upload")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Select Dataset</TabsTrigger>
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            </TabsList>

            <TabsContent value="select">
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
            </TabsContent>

            <TabsContent value="upload">
              <CSVUpload onFileUpload={async (prompts) => {
                try {
                  // Create a new dataset from the uploaded prompts
                  const { data, error } = await supabase
                    .from('datasets')
                    .insert({
                      name: `Uploaded Dataset ${new Date().toISOString()}`,
                      user_id: '00000000-0000-0000-0000-000000000000',
                      description: `Dataset uploaded with ${prompts.length} prompts`
                    })
                    .select()
                    .single();

                  if (error) throw error;
                  
                  setSelectedDataset(data.id);
                  toast.success("Dataset uploaded successfully");
                } catch (error) {
                  console.error('Error uploading dataset:', error);
                  toast.error("Failed to upload dataset");
                }
              }} />
            </TabsContent>
          </Tabs>
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