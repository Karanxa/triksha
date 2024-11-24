import { useState, useEffect } from "react";
import { Phase, FingerPrintResult } from "./types";
import { InitialPhase } from "./components/InitialPhase";
import { FingerPrintPhase } from "./components/FingerPrintPhase";
import { DatasetAnalysis } from "./components/DatasetAnalysis";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const GeraidEngine = () => {
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

  // Subscribe to scan updates when component mounts or scanId changes
  useEffect(() => {
    if (!scanId) return;

    const subscription = supabase
      .channel(`geraid_scan_${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'llm_scans',
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          const { status, results } = payload.new;
          
          if (status === 'processing') {
            setFingerprintProgress(results?.progress || 0);
            if (results?.fingerprint) {
              setFingerprintResults(results.fingerprint);
              setPhase("dataset_analysis");
            }
          } else if (status === 'completed') {
            setFingerprintProgress(100);
            toast.success('Geraid Engine analysis completed!');
          } else if (status === 'failed') {
            toast.error('Analysis failed: ' + (results?.error || 'Unknown error'));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [scanId]);

  const handleStart = async (newConfig: typeof config) => {
    try {
      setConfig(newConfig);
      setPhase("fingerprinting");
      setIsPaused(false);

      // Create a new scan record
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { data: scan, error } = await supabase
        .from('llm_scans')
        .insert({
          user_id: user.id,
          name: `Geraid Analysis - ${newConfig?.model}`,
          status: 'processing',
          scan_type: 'geraid',
          results: {
            progress: 0,
            provider: newConfig?.provider,
            model: newConfig?.model,
            dataset_id: newConfig?.datasetId
          }
        })
        .select()
        .single();

      if (error) throw error;
      setScanId(scan.id);

    } catch (error) {
      toast.error("Failed to start analysis");
      setPhase("not_started");
    }
  };

  const handleFingerprintComplete = (results: FingerPrintResult) => {
    try {
      setFingerprintResults(results);
      setPhase("dataset_analysis");
    } catch (error) {
      toast.error("Failed to complete fingerprinting");
      setPhase("not_started");
    }
  };

  const handleFingerprintProgress = (progress: number) => {
    setFingerprintProgress(progress);
  };

  const togglePause = async () => {
    if (!scanId) return;

    try {
      const newPausedState = !isPaused;
      setIsPaused(newPausedState);

      await supabase
        .from('llm_scans')
        .update({ 
          results: { 
            ...config,
            is_paused: newPausedState,
            progress: fingerprintProgress
          }
        })
        .eq('id', scanId);

      toast.success(newPausedState ? "Analysis paused" : "Analysis resumed");
    } catch (error) {
      toast.error("Failed to update scan status");
    }
  };

  const renderPhase = () => {
    switch (phase) {
      case "not_started":
        return <InitialPhase onStart={handleStart} />;
      
      case "fingerprinting":
        return config ? (
          <>
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={togglePause}
                className="flex items-center gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    Resume Analysis
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Analysis
                  </>
                )}
              </Button>
            </div>
            <FingerPrintPhase
              config={config}
              onComplete={handleFingerprintComplete}
              onProgress={handleFingerprintProgress}
              isPaused={isPaused}
              scanId={scanId}
            />
          </>
        ) : null;
      
      case "dataset_analysis":
        return config && fingerprintResults ? (
          <>
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={togglePause}
                className="flex items-center gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    Resume Analysis
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Analysis
                  </>
                )}
              </Button>
            </div>
            <DatasetAnalysis 
              config={config}
              fingerprint={fingerprintResults}
              isPaused={isPaused}
              scanId={scanId}
            />
          </>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderPhase()}
    </div>
  );
};