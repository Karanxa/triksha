import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ProviderSelect from "@/components/augment-prompt/ProviderSelect";
import { AttackCategorySelect } from "@/components/datasets/AttackCategorySelect";
import { DatasetSelector } from "./DatasetSelector";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { TablesInsert } from "@/integrations/supabase/types/tables";

export const GeraideForm = () => {
  const session = useSession();
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error("You must be logged in to start a scan");
      return;
    }

    if (!provider || !category || selectedDataset.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const [providerName, model] = provider.split('-');

      const scanData: TablesInsert<'geraide_scans'> = {
        user_id: session.user.id,
        name: `Geraide Scan - ${new Date().toLocaleString()}`,
        provider: providerName,
        model,
        dataset_id: selectedDataset[0],
        status: 'pending'
      };

      const { error } = await supabase
        .from('geraide_scans')
        .insert(scanData);

      if (error) throw error;

      toast.success("Geraide scan started successfully");
      setProvider("");
      setCategory("");
      setSelectedDataset([]);
    } catch (error: any) {
      console.error("Error starting Geraide scan:", error);
      toast.error("Failed to start scan: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProviderSelect
        value={provider}
        onValueChange={setProvider}
      />

      <AttackCategorySelect
        value={category}
        onValueChange={setCategory}
      />

      <div className="space-y-4">
        <Label>Select Dataset</Label>
        <DatasetSelector 
          onDatasetSelected={setSelectedDataset}
        />
        {selectedDataset.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Dataset selected successfully
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Starting Scan..." : "Start Geraide Scan"}
      </Button>
    </form>
  );
};