import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

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
        .select('id, name, description')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading datasets...</span>
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
          {datasets?.map((dataset) => (
            <SelectItem 
              key={dataset.id} 
              value={dataset.id}
              className="flex flex-col items-start"
            >
              <span>{dataset.name}</span>
              {dataset.description && (
                <span className="text-xs text-muted-foreground">{dataset.description}</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {datasets?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No datasets found. Please create a dataset first.
        </p>
      )}
    </div>
  );
};