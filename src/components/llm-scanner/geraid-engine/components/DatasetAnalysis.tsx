import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDatasetAnalysis } from "../hooks/useDatasetAnalysis";
import { AnalysisProgress } from "./AnalysisProgress";
import { FingerPrintResult } from "../types";
import { TypingIndicator } from "../../chat/TypingIndicator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  isPaused: boolean;
  isStopped: boolean;
  lastPausedStep?: {
    phase: string;
    step?: number;
    progress?: number;
  } | null;
}

export const DatasetAnalysis = ({ 
  config, 
  fingerprint, 
  isPaused,
  isStopped,
  lastPausedStep 
}: DatasetAnalysisProps) => {
  const [apiKey, setApiKey] = useState<string>("");
  const { messages, isLoading, progress, results } = useDatasetAnalysis(
    config, 
    fingerprint, 
    isPaused,
    lastPausedStep?.phase === 'dataset_analysis' ? lastPausedStep.progress : undefined
  );

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('api_keys')
          .single();

        if (error) throw error;

        if (!profile?.api_keys?.openai) {
          toast.error("OpenAI API key not found. Please add it in the Keys tab.");
          return;
        }

        setApiKey(profile.api_keys.openai);
      } catch (error) {
        console.error('Error fetching API key:', error);
        toast.error("Failed to fetch API key");
      }
    };

    fetchApiKey();
  }, []);

  // Show toast when analysis is complete
  if (results && !isLoading && progress === 100) {
    toast.success(`Analysis complete! Processed ${results.processedPrompts} prompts`);
  }

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
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : message.role === 'system' 
                        ? 'bg-muted text-muted-foreground' 
                        : 'bg-accent'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && !isPaused && !isStopped && <TypingIndicator />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};