import { useState } from "react";
import { Phase, FingerPrintResult } from "./types";
import { InitialPhase } from "./components/InitialPhase";
import { FingerPrintPhase } from "./components/FingerPrintPhase";
import { DatasetAnalysis } from "./components/DatasetAnalysis";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PauseCircle, PlayCircle, StopCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const [lastPausedStep, setLastPausedStep] = useState<{
    phase: Phase;
    step?: number;
    progress?: number;
  } | null>(null);

  const handleStart = async (newConfig: typeof config) => {
    try {
      setConfig(newConfig);
      setPhase("fingerprinting");
      setIsPaused(false);
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
      // Resume from last paused state
      setIsPaused(false);
      toast.success("Scan resumed");
    } else {
      // Save current state before pausing
      setLastPausedStep({
        phase,
        step: phase === "fingerprinting" ? fingerprintProgress : undefined,
        progress: fingerprintProgress
      });
      setIsPaused(true);
      toast.success("Scan paused");
    }
  };

  const handleStop = () => {
    setPhase("not_started");
    setConfig(null);
    setFingerprintResults(null);
    setFingerprintProgress(0);
    setIsPaused(false);
    setLastPausedStep(null);
    toast.success("Scan stopped");
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
            lastPausedStep={lastPausedStep}
          />
        ) : null;
      
      case "dataset_analysis":
        return config && fingerprintResults ? (
          <DatasetAnalysis 
            config={config}
            fingerprint={fingerprintResults}
            isPaused={isPaused}
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