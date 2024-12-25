import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dataset } from "@/types/dataset";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVUpload } from "../CSVUpload";
import { Database, FileText } from "lucide-react";

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
    onPromptsExtracted([]);
  };

  return (
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
              <div className="mt-4 grid grid-cols-1 gap-4">
                {isLoading ? (
                  <div className="text-center text-muted-foreground">Loading datasets...</div>
                ) : datasets?.length === 0 ? (
                  <div className="text-center text-muted-foreground">No datasets found</div>
                ) : (
                  datasets?.map((dataset) => (
                    <div
                      key={dataset.id}
                      className={`group p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedDataset?.id === dataset.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleDatasetSelect(dataset)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-medium group-hover:text-primary transition-colors">
                            {dataset.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {dataset.description || "No description provided"}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
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
                {prompts.length.toLocaleString()} prompts loaded from CSV
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BatchScanDataset;