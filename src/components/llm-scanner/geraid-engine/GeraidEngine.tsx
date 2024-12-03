import { useState } from "react";
import { ModelSelector } from "./ModelSelector";
import { Chat } from "./components/Chat";
import { DatasetAnalysis } from "./components/DatasetAnalysis";
import { Phase, FingerPrintResult } from "./types";

export const GeraidEngine = () => {
  const [phase, setPhase] = useState<Phase>("not_started");
  const [config, setConfig] = useState<{
    provider: string;
    model: string;
    datasetId: string;
  } | null>(null);
  const [fingerprintResults, setFingerprintResults] = useState<FingerPrintResult | null>(null);

  const startAnalysis = async (newConfig: typeof config) => {
    setPhase("fingerprinting");
    setConfig(newConfig);
  };

  const handleFingerprintComplete = (results: FingerPrintResult) => {
    setFingerprintResults(results);
    setPhase("dataset_analysis");
  };

  if (phase === "not_started") {
    return <ModelSelector onStart={startAnalysis} />;
  }

  if (phase === "fingerprinting") {
    return (
      <Chat 
        config={config} 
        onComplete={handleFingerprintComplete} 
      />
    );
  }

  if (phase === "dataset_analysis" && config && fingerprintResults) {
    return (
      <DatasetAnalysis 
        config={config}
        fingerprint={fingerprintResults}
      />
    );
  }

  return null;
};