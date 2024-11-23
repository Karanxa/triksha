import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModelSelect } from "@/components/llm-scanner/providers/ModelSelect";
import { ScanFormProvider } from "@/components/llm-scanner/ScanFormProvider";
import { DatasetSelector } from "@/components/llm-scanner/DatasetSelector";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types/database";

export const GeraideScanForm = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!provider || !selectedDatasetId) {
      toast.error("Please select both a provider and a dataset");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('geraide_scans')
        .insert({
          user_id: user.id,
          name: `Geraide Scan ${new Date().toISOString()}`,
          provider,
          dataset_id: selectedDatasetId,
          status: 'pending'
        } satisfies Partial<Database['public']['Tables']['geraide_scans']['Insert']>);

      if (error) throw error;

      toast.success("Scan created successfully");
      navigate("/llm-results");
    } catch (error) {
      console.error("Error creating scan:", error);
      toast.error("Failed to create scan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <ScanFormProvider 
        provider={provider}
        onProviderChange={setProvider}
      />

      <div className="space-y-4">
        <DatasetSelector
          onDatasetSelected={(prompts) => {
            if (prompts.length > 0) {
              setSelectedDatasetId(prompts[0]);
            }
          }}
        />
      </div>

      <Button 
        className="w-full" 
        size="lg"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create Geraide Scan"}
      </Button>
    </div>
  );
};