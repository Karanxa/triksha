import { useState } from "react";
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
  const [currentProgress, setCurrentProgress] = useState(0);

  const handleProgress = (progress: number) => {
    setCurrentProgress(progress);
    onProgress(progress);
  };

  return (
    <div className="space-y-4">
      <AnalysisProgress phase="fingerprinting" progress={currentProgress} />
      <Chat 
        config={config} 
        onComplete={onComplete}
        onProgress={handleProgress}
      />
    </div>
  );
};