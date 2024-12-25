import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DatasetSelectorProps {
  selectedDataset: string;
  onDatasetSelect: (value: string) => void;
}

export const DatasetSelector = ({ selectedDataset, onDatasetSelect }: DatasetSelectorProps) => {
  const { data: datasets, isLoading } = useQuery({
    queryKey: ['user-datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Dataset</Label>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading datasets...</span>
        </div>
      </div>
    );
  }

  if (!datasets?.length) {
    return (
      <div className="space-y-2">
        <Label>Dataset</Label>
        <p className="text-sm text-muted-foreground">
          No datasets found. Please create a dataset first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Dataset</Label>
      <Select value={selectedDataset} onValueChange={onDatasetSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a dataset" />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-[200px]">
            {datasets.map((dataset) => (
              <SelectItem 
                key={dataset.id} 
                value={dataset.id}
                className="flex flex-col py-2 cursor-pointer"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{dataset.name}</span>
                  {dataset.description && (
                    <span className="text-xs text-muted-foreground">
                      {dataset.description}
                    </span>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {dataset.category && (
                      <span className="bg-secondary px-1.5 py-0.5 rounded-sm">
                        {dataset.category}
                      </span>
                    )}
                    <span>
                      Created: {new Date(dataset.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};