import { useState } from "react";
import { Phase, FingerPrintResult } from "./types";
import { InitialPhase } from "./components/InitialPhase";
import { FingerPrintPhase } from "./components/FingerPrintPhase";
import { DatasetAnalysis } from "./components/DatasetAnalysis";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PauseCircle, PlayCircle, StopCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

export const GeraidEngine = () => {
  const session = useSession();
  const [phase, setPhase] = useState<Phase>("not_started");
  const [config, setConfig] = useState<{
    provider: string;
    model: string;
    datasetId: string;
  } | null>(null);
  const [fingerprintResults, setFingerprintResults] = useState<FingerPrintResult | null>(null);
  const [fingerprintProgress, setFingerprintProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);

  const handleStart = async (newConfig: typeof config) => {
    try {
      if (!session?.user?.id) {
        toast.error("Please log in to start analysis");
        return;
      }

      setConfig(newConfig);
      
      // Create initial scan record
      const { data: scan, error: scanError } = await supabase
        .from('geraide_scans')
        .insert({
          provider: newConfig?.provider,
          model: newConfig?.model,
          messages: [],
          is_vulnerable: null,
          user_id: session.user.id
        })
        .select()
        .single();

      if (scanError) throw scanError;
      setScanId(scan.id);
      
      setPhase("fingerprinting");
      setIsPaused(false);
    } catch (error) {
      toast.error("Failed to start analysis");
      setPhase("not_started");
    }
  };

  const handleFingerprintComplete = async (results: FingerPrintResult) => {
    try {
      setFingerprintResults(results);
      
      // Update scan with fingerprint results
      if (scanId) {
        const { error: updateError } = await supabase
          .from('geraide_scans')
          .update({
            fingerprint_results: results as any
          })
          .eq('id', scanId);

        if (updateError) throw updateError;
      }
      
      setPhase("dataset_analysis");
    } catch (error) {
      toast.error("Failed to complete fingerprinting");
      setPhase("not_started");
    }
  };

  const handleFingerprintProgress = (progress: number) => {
    setFingerprintProgress(progress);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.success(isPaused ? "Scan resumed" : "Scan paused");
  };

  const handleStop = async () => {
    try {
      if (scanId) {
        // Update scan status when stopping
        const { error: updateError } = await supabase
          .from('geraide_scans')
          .update({
            is_vulnerable: null,
            dataset_analysis_results: null
          })
          .eq('id', scanId);

        if (updateError) throw updateError;
      }
      
      setPhase("not_started");
      setConfig(null);
      setFingerprintResults(null);
      setFingerprintProgress(0);
      setIsPaused(false);
      setScanId(null);
      toast.success("Scan stopped");
    } catch (error) {
      toast.error("Failed to stop scan");
    }
  };

  const renderControls = () => {
    if (phase === "not_started") return null;

    return (
      <div className="flex justify-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePauseResume}
        >
          {isPaused ? (
            <PlayCircle className="h-4 w-4 mr-2" />
          ) : (
            <PauseCircle className="h-4 w-4 mr-2" />
          )}
          {isPaused ? "Resume" : "Pause"}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleStop}
        >
          <StopCircle className="h-4 w-4 mr-2" />
          Stop
        </Button>
      </div>
    );
  };

  const renderPhase = () => {
    switch (phase) {
      case "not_started":
        return (
          <Card className="bg-card/50 border-muted/20">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Configure Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Select a model and dataset to begin the analysis process.
                </p>
              </div>
              <InitialPhase onStart={handleStart} />
            </CardContent>
          </Card>
        );
      
      case "fingerprinting":
        return config ? (
          <FingerPrintPhase
            config={config}
            onComplete={handleFingerprintComplete}
            onProgress={handleFingerprintProgress}
            isPaused={isPaused}
            scanId={scanId}
          />
        ) : null;
      
      case "dataset_analysis":
        return config && fingerprintResults ? (
          <DatasetAnalysis 
            config={config}
            fingerprint={fingerprintResults}
            isPaused={isPaused}
            scanId={scanId}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderControls()}
      {renderPhase()}
    </div>
  );
};