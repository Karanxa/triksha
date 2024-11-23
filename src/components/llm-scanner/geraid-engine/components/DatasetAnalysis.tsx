import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { augmentPrompt } from "../utils/promptAugmentation";
import { processBatchesWithConcurrency } from "../utils/batchProcessor";
import { FingerPrintResult } from "../types";

interface DatasetMetadata {
  prompt: string;
  [key: string]: any;
}

interface DatasetAnalysisProps {
  config: {
    datasetId: string;
  };
  fingerprint: FingerPrintResult;
}

export const DatasetAnalysis = ({ config, fingerprint }: DatasetAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processDataset = async () => {
      setIsProcessing(true);
      setError(null);
      
      try {
        const { data: dataset, error: datasetError } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (datasetError) {
          throw new Error('Failed to fetch dataset');
        }

        const metadata = dataset.metadata as { rows: DatasetMetadata[] };

        if (!metadata?.rows || !Array.isArray(metadata.rows)) {
          throw new Error('No valid prompts found in dataset');
        }

        const extractedPrompts = metadata.rows
          .map(row => row.prompt)
          .filter(Boolean);

        if (extractedPrompts.length === 0) {
          throw new Error('No valid prompts found in dataset');
        }

        const augmentedPrompts = await processBatchesWithConcurrency(
          extractedPrompts,
          5,
          async (prompt) => augmentPrompt(prompt, fingerprint),
          (progress) => setProgress(progress)
        );

        setResults(augmentedPrompts);
        toast.success('Dataset analysis complete');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process dataset';
        setError(message);
        toast.error(message);
      } finally {
        setIsProcessing(false);
      }
    };

    processDataset();
  }, [config.datasetId, fingerprint]);

  if (error) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isProcessing && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing dataset...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <h3 className="text-lg font-medium mb-4">Analysis Results</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{result}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};