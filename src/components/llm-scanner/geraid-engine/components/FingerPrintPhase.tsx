import { Chat } from "./Chat";
import { AnalysisProgress } from "./AnalysisProgress";
import { FingerPrintResult } from "../types";

interface FingerPrintPhaseProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
  };
  onComplete: (results: FingerPrintResult) => void;
  onProgress: (progress: number) => void;
}

export const FingerPrintPhase = ({ config, onComplete, onProgress }: FingerPrintPhaseProps) => {
  return (
    <div className="space-y-4">
      <AnalysisProgress phase="fingerprinting" progress={progress} />
      <Chat 
        config={config} 
        onComplete={onComplete}
        onProgress={onProgress}
      />
    </div>
  );
};