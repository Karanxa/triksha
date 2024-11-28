import { ModelSelector } from "../ModelSelector";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CSVUpload } from "./CSVUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@supabase/auth-helpers-react";

interface InitialPhaseProps {
  onStart: (config: { provider: string; model: string; datasetId: string }) => void;
}

export const InitialPhase = ({ onStart }: InitialPhaseProps) => {
  const session = useSession();
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [datasetSource, setDatasetSource] = useState<"select" | "upload">("select");

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

  const handleCSVUpload = async (prompts: string[]) => {
    if (!session?.user?.id) {
      toast.error("Please log in to upload datasets");
      return;
    }

    try {
      const content = prompts.join('\n');
      const file = new Blob([content], { type: 'text/plain' });
      const filePath = `${session.user.id}/${Date.now()}-dataset.txt`;

      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error: dbError } = await supabase
        .from('datasets')
        .insert({
          name: 'Uploaded Dataset',
          description: `Dataset uploaded from CSV with ${prompts.length} prompts`,
          file_path: filePath,
          user_id: session.user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setSelectedDataset(data.id);
      toast.success("Dataset uploaded successfully");
    } catch (error) {
      console.error('Error uploading dataset:', error);
      toast.error("Failed to upload dataset: " + (error as Error).message);
    }
  };

  const handleStart = () => {
    if (!selectedDataset) {
      toast.error("Please select a dataset");
      return;
    }

    if (!provider) {
      toast.error("Please select a provider");
      return;
    }

    if (!model && provider !== 'custom') {
      toast.error("Please select a model");
      return;
    }

    onStart({
      provider,
      model,
      datasetId: selectedDataset,
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
              <CSVUpload onFileUpload={handleCSVUpload} />
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