import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { processDatasetPrompts, augmentPrompts } from "@/utils/promptAugmentation";
import { FingerPrintResult } from "../types";

interface DatasetAnalysisProps {
  config: {
    datasetId: string;
    provider: string;
    model: string;
  };
  fingerprint: FingerPrintResult;
}

export const DatasetAnalysis = ({ config, fingerprint }: DatasetAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Array<{
    original: string;
    augmented: string;
    response?: string;
    error?: string;
  }>>([]);

  useEffect(() => {
    const analyzeDataset = async () => {
      setIsProcessing(true);
      setProgress(0);
      
      try {
        // Get user's API key
        const { data: profile } = await supabase
          .from('profiles')
          .select('api_keys')
          .single();

        if (!profile?.api_keys?.openai) {
          throw new Error('OpenAI API key not found. Please add it in Settings.');
        }

        // Get original prompts from dataset
        const originalPrompts = await processDatasetPrompts(config.datasetId);
        if (originalPrompts.length === 0) {
          throw new Error('No prompts found in dataset');
        }

        setProgress(20);

        // Augment prompts using OpenAI
        const augmentedPrompts = await augmentPrompts(originalPrompts, profile.api_keys.openai);
        setProgress(50);

        // Process each prompt with the target model
        const allResults = [];
        for (let i = 0; i < originalPrompts.length; i++) {
          try {
            const response = await supabase.functions.invoke('scan-llm', {
              body: {
                prompts: [augmentedPrompts[i]],
                provider: config.provider,
                model: config.model
              }
            });

            allResults.push({
              original: originalPrompts[i],
              augmented: augmentedPrompts[i],
              response: response.data?.results?.[0]?.model_response,
              error: response.error?.message
            });
          } catch (error) {
            allResults.push({
              original: originalPrompts[i],
              augmented: augmentedPrompts[i],
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }

          // Update progress
          setProgress(50 + Math.floor((i + 1) / originalPrompts.length * 50));
        }

        setResults(allResults);
        toast.success('Dataset analysis complete');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process dataset';
        toast.error(message);
      } finally {
        setIsProcessing(false);
        setProgress(100);
      }
    };

    analyzeDataset();
  }, [config]);

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
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div>
                    <h4 className="font-medium">Original Prompt:</h4>
                    <p className="text-sm text-muted-foreground">{result.original}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Augmented Prompt:</h4>
                    <p className="text-sm text-muted-foreground">{result.augmented}</p>
                  </div>
                  {result.response && (
                    <div>
                      <h4 className="font-medium">Model Response:</h4>
                      <p className="text-sm text-muted-foreground">{result.response}</p>
                    </div>
                  )}
                  {result.error && (
                    <div className="text-red-500 text-sm">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};