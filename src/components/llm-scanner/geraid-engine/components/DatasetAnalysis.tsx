import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "../../chat/ChatMessages";
import { useDatasetAnalysis } from "../hooks/useDatasetAnalysis";
import { FingerPrintResult } from "../types";

interface DatasetAnalysisProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
  };
  fingerprint: FingerPrintResult;
}

export const DatasetAnalysis = ({ config, fingerprint }: DatasetAnalysisProps) => {
  const [isStarted, setIsStarted] = useState(false);
  const { messages, isLoading, isComplete } = useDatasetAnalysis(
    config,
    fingerprint,
    isStarted
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Dataset Analysis</h3>
          {!isStarted ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Ready to analyze your dataset using the model fingerprint results.
              </p>
              <Button onClick={() => setIsStarted(true)}>
                Start Dataset Analysis
              </Button>
            </div>
          ) : (
            <ChatMessages messages={messages} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>

      {isComplete && (
        <div className="flex justify-end">
          <Button variant="secondary">
            Download Analysis Report
          </Button>
        </div>
      )}
    </div>
  );
};