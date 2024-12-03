import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RedTeamingProvider } from "./RedTeamingProvider";
import { RedTeamingDataset } from "./RedTeamingDataset";
import { RedTeamingChat } from "./RedTeamingChat";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const RedTeaming = () => {
  const [provider, setProvider] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleStartScan = async () => {
    if (!provider || !selectedDataset) {
      toast.error("Please select both a provider and dataset");
      return;
    }

    if (!profile?.api_keys?.[provider.split('-')[0]]) {
      toast.error(`Please configure your ${provider.split('-')[0]} API key in settings`);
      return;
    }

    setIsScanning(true);
    // Scan will be started by the RedTeamingChat component
  };

  const handlePauseScan = () => {
    setIsPaused(prev => !prev);
    toast.info(isPaused ? "Scan resumed" : "Scan paused");
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setIsPaused(false);
    toast.info("Scan stopped");
  };

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Red Teaming Analysis</h1>
      
      <Card>
        <CardContent className="pt-6 space-y-6">
          <RedTeamingProvider
            provider={provider}
            onProviderChange={setProvider}
          />

          <RedTeamingDataset
            selectedDataset={selectedDataset}
            onDatasetSelect={setSelectedDataset}
          />

          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              onClick={handleStartScan}
              disabled={isScanning || !provider || !selectedDataset}
            >
              Start Analysis
            </button>

            {isScanning && (
              <>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  onClick={handlePauseScan}
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={handleStopScan}
                >
                  Stop
                </button>
              </>
            )}
          </div>

          <RedTeamingChat
            isScanning={isScanning}
            isPaused={isPaused}
            provider={provider}
            datasetId={selectedDataset}
          />
        </CardContent>
      </Card>
    </div>
  );
};