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
  const [isStopped, setIsStopped] = useState(false);
  const [lastPausedStep, setLastPausedStep] = useState<{
    phase: Phase;
    step?: number;
    progress?: number;
  } | null>(null);
  const [currentMessages, setCurrentMessages] = useState<any[]>([]);

  const handleStart = async (newConfig: typeof config) => {
    try {
      setConfig(newConfig);
      setPhase("fingerprinting");
      setIsPaused(false);
      setIsStopped(false);
      setLastPausedStep(null);
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

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      toast.success("Scan resumed");
    } else {
      setLastPausedStep({
        phase,
        step: phase === "fingerprinting" ? fingerprintProgress : undefined,
        progress: fingerprintProgress
      });
      setIsPaused(true);
      toast.success("Scan paused");
    }
  };

  const handleStop = async () => {
    setIsStopped(true);
    
    // Save the conversation with a stop message
    if (config && fingerprintResults) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        await supabase.from('geraide_scans').insert({
          user_id: user.id,
          provider: config.provider,
          model: config.model,
          messages: [...currentMessages, { role: 'system', content: 'Scan stopped manually by user' }],
          fingerprint_results: fingerprintResults,
          is_vulnerable: null // Since scan was stopped, we can't determine vulnerability
        });
        
        toast.success("Scan stopped and conversation saved");
      } catch (error) {
        console.error("Error saving stopped scan:", error);
        toast.error("Failed to save scan results");
      }
    }

    // Reset all states
    setPhase("not_started");
    setConfig(null);
    setFingerprintResults(null);
    setFingerprintProgress(0);
    setIsPaused(false);
    setLastPausedStep(null);
  };

  const renderControls = () => {
    if (phase === "not_started") return null;

    return (
      <div className="flex justify-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePauseResume}
          disabled={isStopped}
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
          disabled={isStopped}
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
            isStopped={isStopped}
            lastPausedStep={lastPausedStep}
          />
        ) : null;
      
      case "dataset_analysis":
        return config && fingerprintResults ? (
          <DatasetAnalysis 
            config={config}
            fingerprint={fingerprintResults}
            isPaused={isPaused}
            isStopped={isStopped}
            lastPausedStep={lastPausedStep}
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
