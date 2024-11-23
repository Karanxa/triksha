import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { Chat } from "./components/Chat";
import { Phase, FingerPrintResult } from "./types";

export const GeraidEngine = () => {
  const [phase, setPhase] = useState<Phase>('not_started');
  const [config, setConfig] = useState<{
    provider: string;
    model: string;
    datasetId: string;
  } | null>(null);
  const [fingerprintResults, setFingerprintResults] = useState<FingerPrintResult | null>(null);

  const startAnalysis = async (newConfig: typeof config) => {
    setPhase('fingerprinting');
    setConfig(newConfig);
  };

  const handleFingerprintComplete = (results: FingerPrintResult) => {
    setFingerprintResults(results);
    setPhase('completed');
  };

  if (phase === 'not_started') {
    return <ModelSelector onStart={startAnalysis} />;
  }

  return (
    <div className="space-y-4">
      <Chat 
        config={config} 
        onComplete={handleFingerprintComplete} 
      />

      {phase === 'completed' && (
        <div className="flex justify-end">
          <Button onClick={() => setPhase('dataset_analysis')}>
            Continue to Dataset Analysis
          </Button>
        </div>
      )}
    </div>
  );
};