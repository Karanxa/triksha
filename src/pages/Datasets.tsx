import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Dataset {
  id: string;
  title: string;
  description: string;
  downloads: number;
  likes: number;
  formats: string[];
}

const Datasets = () => {
  const { toast } = useToast();
  const [useCustomSearch, setUseCustomSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets', selectedCategory, useCustomSearch, searchQuery],
    queryFn: async () => {
      if (!selectedCategory) return [];
      
      try {
        const { data, error } = await supabase.functions.invoke('fetch-datasets', {
          body: { 
            category: selectedCategory,
            useCustomSearch,
            searchQuery: useCustomSearch ? searchQuery : undefined
          }
        });

        if (error) throw error;

        return data.datasets.map((dataset: any) => ({
          id: dataset.id,
          title: dataset.id.split('/').pop(),
          description: dataset.description || 'No description available',
          downloads: dataset.downloads || 0,
          likes: dataset.likes || 0,
          formats: ['Dataset']
        }));
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching datasets",
          description: "Please make sure you've added your Hugging Face API key in settings."
        });
        return [];
      }
    },
    enabled: !!selectedCategory && (!useCustomSearch || !!searchQuery)
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={useCustomSearch}
                onCheckedChange={setUseCustomSearch}
                id="custom-search"
              />
              <label htmlFor="custom-search" className="text-sm">
                Use custom search keywords
              </label>
            </div>
          </div>

          <div className="w-full">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Attack Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prompt-injection">Prompt Injection</SelectItem>
                <SelectItem value="data-extraction">Data Extraction</SelectItem>
                <SelectItem value="model-manipulation">Model Manipulation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {useCustomSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {datasets?.map((dataset) => (
                <Card key={dataset.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{dataset.title}</CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {dataset.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{dataset.downloads} downloads</span>
                      <span>{dataset.likes} likes</span>
                    </div>
                    <div className="flex gap-2">
                      {dataset.formats.map((format) => (
                        <Button
                          key={format}
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          {format}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Datasets;