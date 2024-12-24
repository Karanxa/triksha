import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface DatasetSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const DatasetSelect = ({ value, onValueChange }: DatasetSelectProps) => {
  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
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
      <div className="space-y-2">
        <Label className="text-white">Dataset</Label>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span className="text-sm text-white/60">Loading datasets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-white">Dataset</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="bg-white/5 border-white/10 text-white">
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
        <p className="text-sm text-white/60">
          No datasets found. Please create a dataset first.
        </p>
      )}
    </div>
  );
};