import { useState } from "react";
import { FingerPrintPhase } from "./components/FingerPrintPhase";
import { DatasetAnalysis } from "./components/DatasetAnalysis";
import { InitialPhase } from "./components/InitialPhase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PauseCircle, PlayCircle, StopCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type Phase = "not_started" | "fingerprinting" | "dataset_analysis";

export const GeraidEngine = () => {
  const [phase, setPhase] = useState<Phase>("not_started");
  const [config, setConfig] = useState<any>(null);
  const [fingerprintResults, setFingerprintResults] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<any[]>([]);
  const [lastPausedStep, setLastPausedStep] = useState<any>(null);

  const handleStart = (config: any) => {
    setConfig(config);
    setPhase("fingerprinting");
    setIsPaused(false);
    setIsStopped(false);
    setCurrentMessages([]);
    setLastPausedStep(null);
  };

  const handleFingerprint = (results: any) => {
    setFingerprintResults(results);
    setPhase("dataset_analysis");
  };

  const handlePause = () => {
    setIsPaused(true);
    toast.info("Scan paused");
  };

  const handleResume = () => {
    setIsPaused(false);
    toast.info("Scan resumed");
  };

  const handleStop = async () => {
    setIsStopped(true);
    toast.info("Scan stopped");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save scan results to database using new table name
      await supabase.from('contextual_scans').insert({
        user_id: user.id,
        provider: config.provider,
        model: config.model,
        messages: [...currentMessages, { role: 'system', content: 'Scan stopped manually by user' }],
        fingerprint_results: fingerprintResults,
        is_vulnerable: null
      });
      
    } catch (error) {
      console.error('Error saving scan results:', error);
      toast.error('Failed to save scan results');
    }
  };

  const renderPhase = () => {
    switch (phase) {
      case "not_started":
        return (
          <Card>
            <CardContent className="p-6">
              <InitialPhase onStart={handleStart} />
            </CardContent>
          </Card>
        );

      case "fingerprinting":
        return (
          <div className="space-y-4">
            <div className="flex justify-end space-x-2">
              {!isStopped && (
                <>
                  {isPaused ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResume}
                      className="flex items-center gap-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Resume
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePause}
                      className="flex items-center gap-2"
                    >
                      <PauseCircle className="h-4 w-4" />
                      Pause
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStop}
                className="flex items-center gap-2"
                disabled={isStopped}
              >
                <StopCircle className="h-4 w-4" />
                Stop
              </Button>
            </div>

            <FingerPrintPhase
              config={config}
              onComplete={handleFingerprint}
              onProgress={(progress) => {
                setLastPausedStep({
                  phase: "fingerprinting",
                  progress
                });
              }}
              isPaused={isPaused}
              isStopped={isStopped}
              lastPausedStep={lastPausedStep}
            />
          </div>
        );

      case "dataset_analysis":
        return (
          <div className="space-y-4">
            <div className="flex justify-end space-x-2">
              {!isStopped && (
                <>
                  {isPaused ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResume}
                      className="flex items-center gap-2"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Resume
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePause}
                      className="flex items-center gap-2"
                    >
                      <PauseCircle className="h-4 w-4" />
                      Pause
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStop}
                className="flex items-center gap-2"
                disabled={isStopped}
              >
                <StopCircle className="h-4 w-4" />
                Stop
              </Button>
            </div>

            <DatasetAnalysis
              config={config}
              fingerprint={fingerprintResults}
              isPaused={isPaused}
              isStopped={isStopped}
              lastPausedStep={lastPausedStep}
            />
          </div>
        );
    }
  };

  return (
    <div className="container py-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Geraide Engine</h1>
      {renderPhase()}
    </div>
  );
};
