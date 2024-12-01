import { useState } from "react";
import { Phase, FingerPrintResult } from "./types";
import { InitialPhase } from "./components/InitialPhase";
import { FingerPrintPhase } from "./components/FingerPrintPhase";
import { DatasetAnalysis } from "./components/DatasetAnalysis";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";

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

  const handleStart = async (newConfig: typeof config) => {
    try {
      setConfig(newConfig);
      setPhase("fingerprinting");
      setIsPaused(false);
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

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast.success(isPaused ? "Scan resumed" : "Scan paused");
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
                    Resume Scan
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Scan
                  </>
                )}
              </Button>
            </div>
            <FingerPrintPhase
              config={config}
              onComplete={handleFingerprintComplete}
              onProgress={handleFingerprintProgress}
              isPaused={isPaused}
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