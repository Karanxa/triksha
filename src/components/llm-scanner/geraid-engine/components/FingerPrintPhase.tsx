import { useState } from "react";
import { Chat } from "./Chat";
import { AnalysisProgress } from "./AnalysisProgress";
import { FingerPrintResult } from "../types";

interface FingerPrintPhaseProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
    customEndpoint?: {
      url: string;
      apiKey: string;
      headers: string;
      method: string;
    };
  };
  onComplete: (results: FingerPrintResult) => void;
  onProgress: (progress: number) => void;
  isPaused: boolean;
  lastPausedStep?: {
    phase: string;
    step?: number;
    progress?: number;
  } | null;
}

export const FingerPrintPhase = ({ 
  config, 
  onComplete, 
  onProgress,
  isPaused,
  lastPausedStep
}: FingerPrintPhaseProps) => {
  const [currentProgress, setCurrentProgress] = useState(
    lastPausedStep?.phase === 'fingerprinting' ? lastPausedStep.progress || 0 : 0
  );

  const handleProgress = (progress: number) => {
    if (!isPaused) {
      setCurrentProgress(progress);
      onProgress(progress);
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
        startFromStep={lastPausedStep?.step}
      />
    </div>
  );
};