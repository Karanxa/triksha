import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CSVUpload } from "../CSVUpload";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, FileText, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatasetMetadata {
  promptCount: number;
  useOpenAI?: boolean;
  method?: string;
  recipe?: string;
  adversarialConfig?: any;
}

interface Dataset {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  metadata: DatasetMetadata | null;
}

interface BatchScanDatasetProps {
  prompts: string[];
  onPromptsExtracted: (prompts: string[]) => void;
}

export const BatchScanDataset = ({ prompts, onPromptsExtracted }: BatchScanDatasetProps) => {
  const [selectedDataset, setSelectedDataset] = useState("");

  const { data: datasets } = useQuery({
    queryKey: ['user-datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('id, name, description, category, metadata')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        metadata: item.metadata as DatasetMetadata
      })) as Dataset[];
    }
  });

  const handleDatasetSelect = async (datasetId: string) => {
    try {
      setSelectedDataset(datasetId);
      
      if (datasetId) {
        console.log('Dataset selected:', datasetId);
        
        const { data: dataset, error: datasetError } = await supabase
          .from('datasets')
          .select('file_path')
          .eq('id', datasetId)
          .single();

        if (datasetError) throw datasetError;
        if (!dataset?.file_path) {
          throw new Error('Dataset file not found');
        }

        const { data: fileData, error: downloadError } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path);

        if (downloadError) throw downloadError;

        const text = await fileData.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const headers = lines[0].toLowerCase().split(',');
        
        const promptIndex = headers.findIndex(header => 
          header === 'prompts' || header === 'prompt' || header === 'text'
        );

        if (promptIndex === -1) {
          throw new Error('Dataset must have a prompts, prompt, or text column');
        }

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
        toast.success(`${extractedPrompts.length} prompts loaded from dataset`);
      }
    } catch (error) {
      console.error('Error selecting dataset:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load dataset');
      onPromptsExtracted([]);
    }
  };

  return (
    <Card className="border border-border/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="select">Select Dataset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <CSVUpload 
                onPromptsExtracted={onPromptsExtracted}
                selectedDataset={selectedDataset}
              />
            </TabsContent>

            <TabsContent value="select" className="space-y-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {datasets?.map((dataset) => (
                    <Card 
                      key={dataset.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedDataset === dataset.id && "border-primary bg-primary/5"
                      )}
                      onClick={() => handleDatasetSelect(dataset.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            <Database className="h-4 w-4 text-primary" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <h3 className="font-medium leading-none">
                              {dataset.name}
                            </h3>
                            {dataset.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {dataset.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              {dataset.category && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <FolderOpen className="h-3 w-3" />
                                  {dataset.category}
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                {dataset.metadata?.promptCount || 0} prompts
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {prompts.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {prompts.length} prompts loaded
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
