import { useState } from "react";
import { Chat } from "./Chat";
import { AnalysisProgress } from "./AnalysisProgress";
import { FingerPrintResult } from "../types";
import { FINGERPRINTING_QUESTIONS } from '../constants/questions';

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

  const handleProgress = (questionIndex: number) => {
    if (!isPaused && !isStopped) {
      const totalQuestions = Object.keys(FINGERPRINTING_QUESTIONS).length;
      const progress = Math.round((questionIndex / totalQuestions) * 100);
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