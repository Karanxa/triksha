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
  isPaused: boolean;
  isStopped: boolean;
  scanId: string | null;
  onScanIdUpdate: (id: string) => void;
}

export const FingerPrintPhase = ({ 
  config, 
  onComplete,
  isPaused,
  isStopped,
  scanId,
  onScanIdUpdate
}: FingerPrintPhaseProps) => {
  const [currentProgress, setCurrentProgress] = useState(0);

  const handleProgress = (progress: number) => {
    if (!isPaused && !isStopped) {
      setCurrentProgress(progress);
    }
  };

  return (
    <div className="space-y-4">
      <AnalysisProgress 
        phase="fingerprinting" 
        progress={currentProgress}
        isPaused={isPaused}
      />
      <Chat 
        config={config} 
        onComplete={onComplete}
        onProgress={handleProgress}
        isPaused={isPaused}
        isStopped={isStopped}
        scanId={scanId}
        onScanIdUpdate={onScanIdUpdate}
      />
    </div>
  );
};