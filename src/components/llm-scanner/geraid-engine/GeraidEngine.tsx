import { useState } from "react";
import { Phase, FingerPrintResult } from "./types";
import { InitialPhase } from "./components/InitialPhase";
import { FingerPrintPhase } from "./components/FingerPrintPhase";
import { DatasetAnalysis } from "../../datasets/analysis/DatasetAnalysis";
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
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);

  const handleStart = async (newConfig: typeof config) => {
    try {
      setConfig(newConfig);
      setPhase("fingerprinting");
      setIsPaused(false);
      setIsStopped(false);
      toast.success("Starting model analysis...");
    } catch (error) {
      toast.error("Failed to start analysis");
      setPhase("not_started");
    }
  };

  const handleFingerprintComplete = (results: FingerPrintResult) => {
    try {
      setFingerprintResults(results);
      setPhase("dataset_analysis");
      toast.success("Fingerprinting complete, starting dataset analysis...");
    } catch (error) {
      toast.error("Failed to complete fingerprinting");
      setPhase("not_started");
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    toast.success(isPaused ? "Scan resumed" : "Scan paused");
  };

  const handleStop = async () => {
    setIsStopped(true);
    setPhase("not_started");
    setConfig(null);
    setFingerprintResults(null);
    setIsPaused(false);
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
        >
          <StopCircle className="h-4 w-4 mr-2" />
          Stop
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderControls()}
      {phase === "not_started" ? (
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
      ) : phase === "fingerprinting" && config ? (
        <FingerPrintPhase
          config={config}
          onComplete={handleFingerprintComplete}
          isPaused={isPaused}
          isStopped={isStopped}
          scanId={scanId}
          onScanIdUpdate={setScanId}
        />
      ) : phase === "dataset_analysis" && config && fingerprintResults ? (
        <DatasetAnalysis 
          config={config}
          fingerprint={fingerprintResults}
          isPaused={isPaused}
          isStopped={isStopped}
          scanId={scanId}
        />
      ) : null}
    </div>
  );
};