import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { augmentPrompt } from "../utils/promptAugmentation";
import { processBatchesWithConcurrency } from "../utils/batchProcessor";
import { FingerPrintResult } from "../types";

interface DatasetAnalysisProps {
  config: {
    datasetId: string;
  };
  fingerprint: FingerPrintResult;
}

interface DatasetMetadata {
  prompt: string;
  [key: string]: any;
}

export const DatasetAnalysis = ({ config, fingerprint }: DatasetAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    const processDataset = async () => {
      setIsProcessing(true);
      try {
        const { data: dataset, error: datasetError } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (datasetError) {
          toast.error('Failed to fetch dataset');
          return;
        }

        const metadata = dataset.metadata as { rows: DatasetMetadata[] };

        if (!metadata?.rows || !Array.isArray(metadata.rows)) {
          toast.error('No valid prompts found in dataset');
          return;
        }

        // Extract prompts from the rows
        const extractedPrompts = metadata.rows.map(row => row.prompt).filter(Boolean);

        if (extractedPrompts.length === 0) {
          toast.error('No valid prompts found in dataset');
          return;
        }

        // Process prompts in batches of 5 with progress tracking
        const augmentedPrompts = await processBatchesWithConcurrency(
          extractedPrompts,
          5, // Process 5 prompts concurrently
          async (prompt) => augmentPrompt(prompt, fingerprint),
          (progress) => setProgress(progress)
        );

        setResults(augmentedPrompts);
        toast.success('Dataset analysis complete');
      } catch (error) {
        console.error('Error processing dataset:', error);
        toast.error('Failed to process dataset');
      } finally {
        setIsProcessing(false);
      }
    };

    processDataset();
  }, [config.datasetId, fingerprint]);

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