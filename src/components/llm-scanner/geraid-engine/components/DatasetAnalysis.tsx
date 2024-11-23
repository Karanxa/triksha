import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessages } from "../../chat/ChatMessages";
import { Button } from "@/components/ui/button";
import { AnalysisProgress } from "./AnalysisProgress";
import { useDatasetAnalysis } from "../hooks/useDatasetAnalysis";
import { FingerPrintResult } from "../types";
import { toast } from "sonner";

interface DatasetAnalysisProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
  };
  fingerprint: FingerPrintResult;
}

export const DatasetAnalysis = ({ config, fingerprint }: DatasetAnalysisProps) => {
  const { messages, isLoading, progress, results } = useDatasetAnalysis(config, fingerprint);

  useEffect(() => {
    toast.info("Starting dataset analysis phase", {
      description: "Augmenting prompts based on model fingerprint results"
    });
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Dataset Analysis</h3>
          <AnalysisProgress phase="dataset_analysis" progress={progress} />
          <ChatMessages messages={messages} isLoading={isLoading} />
        </CardContent>
      </Card>

      {results && (
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => {
            // Download results logic here
            console.log("Downloading results:", results);
          }}>
            Download Analysis Report
          </Button>
        </div>
      )}
    </div>
  );
};