import { Card, CardContent } from "@/components/ui/card";
import { useDatasetAnalysis } from "../hooks/useDatasetAnalysis";
import { AnalysisProgress } from "./AnalysisProgress";
import { FingerPrintResult } from "../types";
import { TypingIndicator } from "../../chat/TypingIndicator";

export interface DatasetAnalysisProps {
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
  fingerprint: FingerPrintResult;
  isPaused?: boolean;
}

export const DatasetAnalysis = ({ config, fingerprint, isPaused }: DatasetAnalysisProps) => {
  const { messages, isLoading, progress, results } = useDatasetAnalysis(config, fingerprint);

  return (
    <div className="space-y-4">
      <AnalysisProgress 
        phase="dataset_analysis" 
        progress={progress}
        isPaused={isPaused}
      />
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Dataset Analysis</h3>
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : message.role === 'system' ? 'bg-muted text-muted-foreground' : 'bg-accent'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && <TypingIndicator />}
        </CardContent>
      </Card>
    </div>
  );
};