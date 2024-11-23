import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DatasetSelectorProps {
  onDatasetSelected: (prompts: string[]) => void;
}

export const DatasetSelector = ({ onDatasetSelected }: DatasetSelectorProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const { data: datasets, isLoading } = useQuery({
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

  const handleDatasetSelect = async (datasetId: string, filePath: string | null) => {
    if (!filePath) {
      toast.error("Dataset file not found");
      return;
    }

    setLoading(datasetId);
    try {
      const { data, error } = await supabase.storage
        .from('datasets')
        .download(filePath);

      if (error) throw error;

      const text = await data.text();
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      
      if (lines.length === 0) {
        throw new Error("Dataset is empty");
      }

      const headers = lines[0].toLowerCase().split(",").map(header => header.trim());
      
      // Look for either 'prompt' or 'original_prompt' column
      const promptIndex = headers.findIndex(header => 
        header === "prompt" || header === "original_prompt"
      );

      if (promptIndex === -1) {
        throw new Error("No prompt column found in dataset");
      }

      // Skip header row and process the prompts
      const prompts = lines.slice(1)
        .map(line => {
          const values = line.split(',').map(val => val.trim());
          return values[promptIndex];
        })
        .filter(Boolean);

      if (prompts.length === 0) {
        throw new Error("No valid prompts found in dataset");
      }

      onDatasetSelected(prompts);
      toast.success(`${prompts.length} prompts loaded from dataset`);
    } catch (error: any) {
      console.error("Error loading dataset:", error);
      toast.error(error.message || "Failed to load dataset");
    } finally {
      setLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2 p-1">
        <h3 className="text-lg font-medium mb-4">Your Datasets</h3>
        {datasets?.map((dataset) => (
          <Card key={dataset.id} className="cursor-pointer hover:bg-accent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{dataset.name}</h4>
                  {dataset.description && (
                    <p className="text-sm text-muted-foreground">{dataset.description}</p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={!!loading}
                  onClick={() => handleDatasetSelect(dataset.id, dataset.file_path)}
                >
                  {loading === dataset.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Select'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {datasets?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No datasets found. Create some in the Datasets section first.
          </p>
        )}
      </div>
    </ScrollArea>
  );
};