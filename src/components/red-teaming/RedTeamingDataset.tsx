import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/augment-prompt/FileUpload";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RedTeamingDatasetProps {
  selectedDataset: string | null;
  onDatasetSelect: (id: string | null) => void;
}

export const RedTeamingDataset = ({
  selectedDataset,
  onDatasetSelect
}: RedTeamingDatasetProps) => {
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

  const handleFileUpload = async (prompts: string) => {
    // Create a new dataset from the uploaded file
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const name = `Red Team Dataset ${new Date().toISOString()}`;
    const { data, error } = await supabase
      .from('datasets')
      .insert({
        name,
        user_id: user.id,
        category: 'red-teaming'
      })
      .select()
      .single();

    if (error) throw error;
    onDatasetSelect(data.id);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="existing">
        <TabsList>
          <TabsTrigger value="existing">Existing Datasets</TabsTrigger>
          <TabsTrigger value="upload">Upload Dataset</TabsTrigger>
        </TabsList>

        <TabsContent value="existing">
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {datasets?.map((dataset) => (
                  <Card
                    key={dataset.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedDataset === dataset.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => onDatasetSelect(dataset.id)}
                  >
                    <h3 className="font-medium">{dataset.name}</h3>
                    {dataset.description && (
                      <p className="text-sm text-muted-foreground">
                        {dataset.description}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="upload">
          <FileUpload onFileUpload={handleFileUpload} />
        </TabsContent>
      </Tabs>
    </div>
  );
};