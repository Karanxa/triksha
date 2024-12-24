import { useState } from "react";
import { ContextualChatbot } from "./ContextualChatbot";
import { DatasetAnalysis } from "@/components/datasets/analysis/DatasetAnalysis";
import { FingerPrintResult } from "./types";
import { Button } from "@/components/ui/button";
import { PauseCircle, PlayCircle, StopCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const ContextualEngine = () => {
  const [config, setConfig] = useState<{
    provider: string;
    model: string;
    datasetId: string;
  } | null>(null);
  const [fingerprintResults, setFingerprintResults] = useState<FingerPrintResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);

  const handleFingerprint = (results: FingerPrintResult) => {
    setFingerprintResults(results);
  };

  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
    toast.success(isPaused ? "Scan resumed" : "Scan paused");
  };

  const handleStop = () => {
    setShowStopDialog(true);
  };

  const confirmStop = () => {
    setConfig(null);
    setFingerprintResults(null);
    setIsPaused(false);
    setShowStopDialog(false);
    toast.success("Scan stopped");
  };

  return (
    <div className="space-y-6">
      {config && (
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
      )}

      <ContextualChatbot 
        onFingerprint={handleFingerprint} 
        isPaused={isPaused}
        onPauseResume={handlePauseResume}
      />
      
      {fingerprintResults && config && (
        <DatasetAnalysis 
          config={config}
          fingerprint={fingerprintResults}
        />
      )}

      <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Scan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop the current scan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStop}>Stop Scan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};