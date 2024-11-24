import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FingerPrintResult } from '../types';
import { Progress } from "@/components/ui/progress";

export interface DatasetAnalysisProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
  };
  fingerprint: FingerPrintResult;
  isPaused: boolean;
  scanId: string | null;
}

export const DatasetAnalysis = ({ config, fingerprint, isPaused, scanId }: DatasetAnalysisProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Dataset Analysis</h3>
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          <div className="grid gap-4">
            {Object.entries(fingerprint).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <h4 className="font-medium capitalize">{key}</h4>
                <p className="text-sm text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};