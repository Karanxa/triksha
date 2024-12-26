import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface BatchScanDatasetProps {
  selectedDataset: string;
  onDatasetSelect: (datasetId: string) => void;
}

const BatchScanDataset = ({ 
  selectedDataset,
  onDatasetSelect 
}: BatchScanDatasetProps) => {
  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
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
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Dataset</Label>
            <Select value={selectedDataset} onValueChange={onDatasetSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a dataset" />
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
                      <span className="text-xs text-muted-foreground">
                        {dataset.description}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {datasets?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No datasets found. Please create a dataset first.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchScanDataset;