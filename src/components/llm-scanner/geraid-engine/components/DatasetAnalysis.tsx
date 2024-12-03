import { Card, CardContent } from "@/components/ui/card";
import { useDatasetAnalysis } from "../hooks/useDatasetAnalysis";
import { AnalysisProgress } from "./AnalysisProgress";
import { FingerPrintResult } from "../types";
import { TypingIndicator } from "../../chat/TypingIndicator";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { messages, isLoading, progress, results, startAnalysis } = useDatasetAnalysis(config, fingerprint);

  useEffect(() => {
    const fetchDatasetPrompts = async () => {
      try {
        // First get the dataset
        const { data: dataset, error: datasetError } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (datasetError) throw datasetError;

        // Download the file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path);

        if (downloadError) throw downloadError;

        // Parse file content
        const text = await fileData.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        
        if (lines.length === 0) {
          throw new Error('Dataset file is empty');
        }

        // Find the prompt column
        const headers = lines[0].toLowerCase().split(',');
        const promptIndex = headers.findIndex(header => 
          header === 'prompts' || header === 'prompt' || header === 'text' || header === 'original_prompt'
        );

        if (promptIndex === -1) {
          throw new Error('No prompt column found in dataset');
        }

        // Extract prompts
        const prompts = lines.slice(1)
          .map(line => {
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const cleanedValues = values.map(val => val.replace(/^"|"$/g, '').trim());
            return cleanedValues[promptIndex];
          })
          .filter(Boolean);

        if (prompts.length === 0) {
          throw new Error('No valid prompts found in dataset');
        }

        console.log('Found prompts:', prompts); // Debug log
        startAnalysis(prompts);

      } catch (error: any) {
        console.error('Error loading dataset:', error);
        toast.error(error.message || 'Failed to load dataset prompts');
      }
    };

    if (!isPaused) {
      fetchDatasetPrompts();
    }
  }, [config.datasetId, isPaused]);

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
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : message.role === 'system' 
                    ? 'bg-muted text-muted-foreground' 
                    : 'bg-accent'
              }`}>
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