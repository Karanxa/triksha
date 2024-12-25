import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dataset } from "@/types/dataset";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface BatchScanDatasetProps {
  prompts: string[];
  onPromptsExtracted: (prompts: string[]) => void;
}

const BatchScanDataset = ({ prompts, onPromptsExtracted }: BatchScanDatasetProps) => {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

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

  const handleDatasetSelect = async (dataset: Dataset) => {
    setSelectedDataset(dataset);
    
    // Here you would typically load the prompts from the dataset
    // For now, we'll just pass an empty array
    onPromptsExtracted([]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>Loading datasets...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label className="text-base font-medium">Select Dataset</Label>
          <div className="mt-4 grid grid-cols-1 gap-4">
            {datasets?.map((dataset) => (
              <div
                key={dataset.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedDataset?.id === dataset.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => handleDatasetSelect(dataset)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{dataset.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {dataset.description || "No description provided"}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dataset.metadata?.promptCount || 0} prompts
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchScanDataset;