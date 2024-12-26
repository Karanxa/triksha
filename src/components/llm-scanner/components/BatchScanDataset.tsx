import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dataset } from "@/types/dataset";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVUpload } from "../CSVUpload";
import { Database, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    try {
      setSelectedDataset(dataset);
      console.log("Loading dataset:", dataset.id);

      if (!dataset.file_path) {
        throw new Error("Dataset file path not found");
      }

      // Download the CSV file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("datasets")
        .download(dataset.file_path);

      if (downloadError) throw downloadError;

      // Parse CSV content
      const text = await fileData.text();
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      // Find the prompt column
      const headers = lines[0].toLowerCase().split(',');
      const promptIndex = headers.findIndex(header => 
        header === 'prompts' || header === 'prompt' || header === 'text'
      );

      if (promptIndex === -1) {
        throw new Error('No prompt column found in CSV');
      }

      // Extract prompts from CSV
      const extractedPrompts = lines.slice(1)
        .map(line => {
          const values = line.split(',').map(val => val.trim().replace(/^"|"$/g, ''));
          return values[promptIndex];
        })
        .filter(Boolean);

      if (extractedPrompts.length === 0) {
        throw new Error('No valid prompts found in dataset');
      }

      console.log(`Extracted ${extractedPrompts.length} prompts from dataset`);
      onPromptsExtracted(extractedPrompts);
      toast.success(`Loaded ${extractedPrompts.length} prompts from dataset`);

    } catch (error) {
      console.error('Error processing dataset:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process dataset');
      setSelectedDataset(null);
    }
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
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                  <div className="text-center text-muted-foreground col-span-full">Loading datasets...</div>
                ) : datasets?.length === 0 ? (
                  <div className="text-center text-muted-foreground col-span-full">No datasets found</div>
                ) : (
                  datasets?.map((dataset) => (
                    <div
                      key={dataset.id}
                      onClick={() => handleDatasetSelect(dataset)}
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