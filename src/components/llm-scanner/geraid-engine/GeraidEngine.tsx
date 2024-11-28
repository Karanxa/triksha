import { useState } from "react";
import { Phase, FingerPrintResult } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { ScanControls } from "./components/ScanControls";
import { ScanPhases } from "./components/ScanPhases";

export const GeraidEngine = () => {
  const [phase, setPhase] = useState<Phase>("not_started");
  const [config, setConfig] = useState<{
    provider: string;
    model: string;
    datasetId: string;
  } | null>(null);
  const [fingerprintResults, setFingerprintResults] = useState<FingerPrintResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const session = useSession();

  const handleStart = async (newConfig: typeof config) => {
    try {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      if (!newConfig) {
        throw new Error("Invalid configuration");
      }

      setConfig(newConfig);
      setPhase("fingerprinting");
      setIsPaused(false);

      // Create initial scan record
      const { data: scan, error } = await supabase
        .from('geraide_scans')
        .insert({
          provider: newConfig.provider,
          model: newConfig.model,
          messages: [],
          fingerprint_results: null,
          dataset_analysis_results: null,
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) throw error;
      setScanId(scan.id);
      toast.success("Analysis started successfully");

    } catch (error) {
      console.error('Failed to start analysis:', error);
      toast.error("Failed to start analysis");
      setPhase("not_started");
      setConfig(null);
    }
  };

  const handleFingerprintComplete = async (results: FingerPrintResult) => {
    try {
      setFingerprintResults(results);
      setPhase("dataset_analysis");

      if (scanId) {
        const { error } = await supabase
          .from('geraide_scans')
          .update({
            fingerprint_results: results
          })
          .eq('id', scanId);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to complete fingerprinting:', error);
      toast.error("Failed to complete fingerprinting");
      setPhase("not_started");
    }
  };

  const handleDatasetAnalysisComplete = async (results: any) => {
    try {
      if (scanId) {
        const { error } = await supabase
          .from('geraide_scans')
          .update({
            dataset_analysis_results: results,
            is_vulnerable: results.some((r: any) => r.isVulnerable)
          })
          .eq('id', scanId);

        if (error) throw error;
        toast.success("Analysis completed successfully");
      }
    } catch (error) {
      console.error('Failed to save analysis results:', error);
      toast.error("Failed to save analysis results");
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.success(isPaused ? "Scan resumed" : "Scan paused");
  };

  const handleStop = () => {
    setPhase("not_started");
    setConfig(null);
    setFingerprintResults(null);
    setIsPaused(false);
    setScanId(null);
    toast.success("Scan stopped");
  };

  return (
    <div className="space-y-6">
      <ScanControls
        phase={phase}
        isPaused={isPaused}
        onPauseResume={handlePauseResume}
        onStop={handleStop}
      />
      <ScanPhases
        phase={phase}
        config={config}
        fingerprintResults={fingerprintResults}
        isPaused={isPaused}
        scanId={scanId}
        onStart={handleStart}
        onFingerprintComplete={handleFingerprintComplete}
        onFingerprintProgress={(progress) => console.log('Fingerprint progress:', progress)}
        onDatasetAnalysisComplete={handleDatasetAnalysisComplete}
      />
    </div>
  );
};