import { useState } from "react";
import { Chat } from "./Chat";
import { AnalysisProgress } from "./AnalysisProgress";
import { FingerPrintResult } from "../types";
import { supabase } from "@/integrations/supabase/client";

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
  scanId: string | null;
}

export const FingerPrintPhase = ({ 
  config, 
  onComplete, 
  onProgress,
  isPaused,
  scanId
}: FingerPrintPhaseProps) => {
  const [currentProgress, setCurrentProgress] = useState(0);

  const handleProgress = async (progress: number) => {
    if (!isPaused) {
      setCurrentProgress(progress);
      onProgress(progress);

      // Update messages in the database
      if (scanId) {
        const { error: updateError } = await supabase
          .from('geraide_scans')
          .update({
            messages: []  // You'll need to pass the actual messages here
          })
          .eq('id', scanId);

        if (updateError) {
          console.error('Failed to update scan messages:', updateError);
        }
      }
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
        scanId={scanId}
      />
    </div>
  );
};