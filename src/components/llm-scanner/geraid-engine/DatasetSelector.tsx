import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DatasetSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const DatasetSelector = ({ value, onValueChange }: DatasetSelectorProps) => {
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

  return (
    <div className="space-y-2">
      <Label>Dataset</Label>
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="h-[200px] w-full rounded-md border">
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a dataset to analyze" />
            </SelectTrigger>
            <SelectContent>
              {datasets?.map((dataset) => (
                <SelectItem 
                  key={dataset.id} 
                  value={dataset.id}
                  className="flex flex-col items-start py-2"
                >
                  <span className="font-medium">{dataset.name}</span>
                  {dataset.description && (
                    <span className="text-xs text-muted-foreground">
                      {dataset.description}
                    </span>
                  )}
                </SelectItem>
              ))}
              {datasets?.length === 0 && (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No datasets found. Create one in the Datasets section first.
                </div>
              )}
            </SelectContent>
          </Select>
        </ScrollArea>
      )}
    </div>
  );
};