import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dataset } from "@/types/dataset";

interface DatasetMetadata {
  promptCount: number;
  categories: string[];
  format: string;
}

interface Props {
  onSelect: (dataset: Dataset) => void;
}

const BatchScanDataset = ({ onSelect }: Props) => {
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

  const handleDatasetSelect = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    onSelect(dataset);
  };

  if (isLoading) {
    return <div>Loading datasets...</div>;
  }

  const getDatasetMetadata = (metadata: any): DatasetMetadata => {
    // Ensure we return a valid DatasetMetadata object
    return {
      promptCount: metadata?.promptCount || 0,
      categories: metadata?.categories || [],
      format: metadata?.format || 'unknown'
    };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Dataset</h3>
      <div className="grid grid-cols-1 gap-4">
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
                {getDatasetMetadata(dataset.metadata).promptCount} prompts
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BatchScanDataset;