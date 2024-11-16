import { useState } from "react";
import { Input } from "@/components/ui/input";
import { DatasetCard } from "@/components/datasets/DatasetCard";
import { DatasetSearchControls } from "@/components/datasets/DatasetSearchControls";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Datasets = () => {
  const [useCustomSearch, setUseCustomSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets', searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('datasets')
        .select('*')
        .order('downloads', { ascending: false });

      if (useCustomSearch && searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (!useCustomSearch && selectedCategory) {
        query = query.eq('category', selectedCategory.toLowerCase());
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Failed to fetch datasets");
        throw error;
      }

      return data;
    },
  });

  const handleDownload = async (datasetId: string, format: 'csv' | 'txt' | 'zip') => {
    setDownloading(datasetId);
    try {
      // Simulated download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Dataset downloaded in ${format.toUpperCase()} format`);
    } catch (error) {
      toast.error("Failed to download dataset");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-2">Datasets</h1>
        <p className="text-muted-foreground mb-8">Browse and manage datasets for training and testing your LLM models</p>

        <div className="mb-8">
          <DatasetSearchControls
            useCustomSearch={useCustomSearch}
            setUseCustomSearch={setUseCustomSearch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading datasets...</div>
        ) : datasets && datasets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                onDownload={handleDownload}
                downloading={downloading}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No datasets found
          </div>
        )}
      </div>
    </div>
  );
};

export default Datasets;
