import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { DatasetOption } from "./types";
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
        .select('id, name, description, file_path')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to fetch datasets");
        throw error;
      }
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {datasets?.map((dataset) => (
          <Card 
            key={dataset.id} 
            className={`cursor-pointer transition-colors ${
              value === dataset.id ? 'border-primary' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{dataset.name}</h4>
                  {dataset.description && (
                    <p className="text-sm text-muted-foreground">{dataset.description}</p>
                  )}
                </div>
                <Button 
                  variant={value === dataset.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onValueChange(dataset.id)}
                >
                  {value === dataset.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!datasets?.length && (
          <p className="text-center text-muted-foreground py-8">
            No datasets found. Create some in the Datasets section first.
          </p>
        )}
      </div>
    </ScrollArea>
  );
};