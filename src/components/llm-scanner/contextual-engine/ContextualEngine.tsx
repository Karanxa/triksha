import { useState } from "react";
import { ContextualChatbot } from "./ContextualChatbot";
import { DatasetAnalysis } from "../datasets/analysis/DatasetAnalysis";
import { FingerPrintResult } from "./types";

export const ContextualEngine = () => {
  const [config, setConfig] = useState<{
    provider: string;
    model: string;
    datasetId: string;
  } | null>(null);
  const [fingerprintResults, setFingerprintResults] = useState<FingerPrintResult | null>(null);

  const handleFingerprint = (results: FingerPrintResult) => {
    setFingerprintResults(results);
  };

  return (
    <div className="space-y-6">
      <ContextualChatbot onFingerprint={handleFingerprint} />
      {fingerprintResults && config && (
        <DatasetAnalysis 
          config={config}
          fingerprint={fingerprintResults}
        />
      )}
    </div>
  );
};