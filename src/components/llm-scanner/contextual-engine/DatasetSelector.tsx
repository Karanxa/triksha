import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { DatasetOption } from "./types";

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
        .select('id, name, description')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DatasetOption[];
    }
  });

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  return (
    <div className="space-y-2">
      <Label>Dataset</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a dataset" />
        </SelectTrigger>
        <SelectContent>
          {datasets?.map((dataset) => (
            <SelectItem key={dataset.id} value={dataset.id}>
              {dataset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};