import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dataset } from "@/types/dataset";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVUpload } from "../CSVUpload";

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

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs defaultValue="datasets" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="datasets">Existing Datasets</TabsTrigger>
            <TabsTrigger value="csv">Upload CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="datasets" className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Dataset</Label>
              <div className="mt-4 grid grid-cols-1 gap-4">
                {isLoading ? (
                  <div className="text-center py-4">Loading datasets...</div>
                ) : datasets?.length === 0 ? (
                  <div className="text-center py-4">No datasets found</div>
                ) : (
                  datasets?.map((dataset) => (
                    <div
                      key={dataset.id}
                      className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                        selectedDataset?.id === dataset.id
                          ? "border-primary bg-primary/10"
                          : "border-border"
                      }`}
                      onClick={() => handleDatasetSelect(dataset)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-medium">{dataset.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {dataset.description || "No description provided"}
                          </p>
                          {dataset.category && (
                            <div className="text-xs text-primary">
                              Category: {dataset.category}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {dataset.metadata?.promptCount || 0} prompts
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="csv">
            <CSVUpload onPromptsExtracted={onPromptsExtracted} />
            {prompts.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {prompts.length} prompts loaded from CSV
              </p>
            )}
          </TabsContent>
        </CardContent>
      </CardContent>
    </Card>
  );
};

export default BatchScanDataset;