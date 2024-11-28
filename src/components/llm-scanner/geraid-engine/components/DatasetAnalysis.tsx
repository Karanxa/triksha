import { Card, CardContent } from "@/components/ui/card";
import { useDatasetAnalysis } from "../hooks/useDatasetAnalysis";
import { AnalysisProgress } from "./AnalysisProgress";
import { FingerPrintResult } from "../types";
import { TypingIndicator } from "../../chat/TypingIndicator";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CustomEndpoint } from "../../types/CustomEndpoint";

export interface DatasetAnalysisProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
    customEndpoint?: CustomEndpoint;
  };
  fingerprint: FingerPrintResult;
  isPaused?: boolean;
  scanId: string | null;
}

export const DatasetAnalysis = ({ config, fingerprint, isPaused, scanId }: DatasetAnalysisProps) => {
  const { messages, isLoading, progress, startAnalysis } = useDatasetAnalysis(
    {
      provider: config.provider,
      model: config.model,
      datasetId: config.datasetId,
      customEndpoint: config.customEndpoint ? {
        ...config.customEndpoint,
        placeholder: config.customEndpoint.placeholder || '{PROMPT}',
        curlCommand: config.customEndpoint.curlCommand || '',
        inputType: config.customEndpoint.inputType || 'manual'
      } : undefined
    }, 
    fingerprint
  );

  useEffect(() => {
    const updateScanResults = async () => {
      if (scanId && messages.length > 0) {
        const { error: updateError } = await supabase
          .from('geraide_scans')
          .update({
            messages: messages as any,
            dataset_analysis_results: {
              progress,
              messages: messages as any
            } as any
          })
          .eq('id', scanId);

        if (updateError) {
          console.error('Failed to update scan results:', updateError);
        }
      }
    };

    if (!isPaused) {
      updateScanResults();
    }
  }, [messages, progress, scanId, isPaused]);

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

        await startAnalysis(prompts);

      } catch (error: any) {
        console.error('Error loading dataset:', error);
        toast.error(error.message || 'Failed to load dataset prompts');
      }
    };

    if (!isPaused) {
      fetchDatasetPrompts();
    }
  }, [config.datasetId, isPaused, startAnalysis]);

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