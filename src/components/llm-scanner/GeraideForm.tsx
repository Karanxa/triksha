import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ProviderSelect from "@/components/augment-prompt/ProviderSelect";
import { DatasetSelector } from "./DatasetSelector";
import { GeraideChatbot } from "./GeraideChatbot";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

export const GeraideForm = () => {
  const session = useSession();
  const [provider, setProvider] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [fingerprintResults, setFingerprintResults] = useState<any>(null);

  const handleStartGeraide = () => {
    if (!provider || selectedDataset.length === 0) {
      toast.error("Please select a provider and dataset first");
      return;
    }
    setShowChatbot(true);
  };

  const handleFingerprintComplete = async (results: any) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to start a scan");
      return;
    }

    setFingerprintResults(results);
    setIsLoading(true);

    try {
      const [providerName, model] = provider.split('-');

      const { data: scan, error: scanError } = await supabase
        .from('geraide_scans')
        .insert({
          user_id: session.user.id,
          name: `Geraide Scan - ${new Date().toLocaleString()}`,
          provider: providerName,
          model,
          dataset_id: selectedDataset[0],
          status: 'fingerprinting_complete',
          results: {
            fingerprint: results
          }
        })
        .select()
        .single();

      if (scanError) throw scanError;

      toast.success("Fingerprinting completed successfully");
    } catch (error: any) {
      console.error("Error saving fingerprint results:", error);
      toast.error("Failed to save fingerprint results: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (showChatbot) {
    return (
      <GeraideChatbot
        provider={provider.split('-')[0]}
        model={provider.split('-')[1]}
        onFingerprint={handleFingerprintComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProviderSelect
        value={provider}
        onValueChange={setProvider}
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
        onClick={handleStartGeraide}
        className="w-full"
        disabled={isLoading || !provider || selectedDataset.length === 0}
      >
        Start Geraide Analysis
      </Button>
    </div>
  );
};