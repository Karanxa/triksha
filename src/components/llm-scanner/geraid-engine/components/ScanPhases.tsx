import { Card, CardContent } from "@/components/ui/card";
import { InitialPhase } from "./InitialPhase";
import { FingerPrintPhase } from "./FingerPrintPhase";
import { DatasetAnalysis } from "../../../datasets/analysis/DatasetAnalysis";
import { Phase, FingerPrintResult } from "../types";

interface ScanPhasesProps {
  phase: Phase;
  config: {
    provider: string;
    model: string;
    datasetId: string;
  } | null;
  fingerprintResults: FingerPrintResult | null;
  isPaused: boolean;
  scanId: string | null;
  onStart: (config: { provider: string; model: string; datasetId: string }) => void;
  onFingerprintComplete: (results: FingerPrintResult) => void;
  onFingerprintProgress: (progress: number) => void;
  onDatasetAnalysisComplete: (results: any) => void;
}

export const ScanPhases = ({
  phase,
  config,
  fingerprintResults,
  isPaused,
  scanId,
  onStart,
  onFingerprintComplete,
  onFingerprintProgress,
  onDatasetAnalysisComplete
}: ScanPhasesProps) => {
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
            <InitialPhase onStart={onStart} />
          </CardContent>
        </Card>
      );
    
    case "fingerprinting":
      return config ? (
        <FingerPrintPhase
          config={config}
          onComplete={onFingerprintComplete}
          onProgress={onFingerprintProgress}
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
          onComplete={onDatasetAnalysisComplete}
        />
      ) : null;
    
    default:
      return null;
  }
};