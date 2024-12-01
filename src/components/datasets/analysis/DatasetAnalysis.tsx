import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { AnalysisProgress } from "./AnalysisProgress";
import { ChatMessages } from "@/components/llm-scanner/chat/ChatMessages";
import { Card } from "@/components/ui/card";
import { FingerPrintResult } from "@/components/llm-scanner/geraid-engine/types";

interface DatasetAnalysisProps {
  config: {
    datasetId: string;
    provider: string;
    model: string;
  };
  fingerprint: FingerPrintResult;
  isPaused: boolean;
}

export const DatasetAnalysis = ({ config, fingerprint, isPaused }: DatasetAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"augmenting" | "testing">("augmenting");

  useEffect(() => {
    const analyzeDataset = async () => {
      if (isPaused) return;
      
      setIsLoading(true);
      try {
        // Initial message
        setMessages([
          {
            role: 'system',
            content: `Starting dataset analysis for ${config.model} using fingerprint results`
          }
        ]);

        // Process dataset with fingerprint results
        const { data: analysisData, error } = await supabase.functions.invoke('process-geraide-scan', {
          body: {
            datasetId: config.datasetId,
            provider: config.provider,
            model: config.model,
            fingerprint
          }
        });

        if (error) throw error;

        // Update messages as prompts are processed
        const { augmentedPrompts, modelResponses } = analysisData;
        
        // Show augmented prompts
        setCurrentPhase("augmenting");
        for (let i = 0; i < augmentedPrompts.length; i++) {
          if (isPaused) return;
          
          setMessages(prev => [
            ...prev,
            {
              role: 'user',
              content: augmentedPrompts[i]
            }
          ]);
          
          setProgress((i + 1) / augmentedPrompts.length * 50);
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Show model responses
        setCurrentPhase("testing");
        for (let i = 0; i < modelResponses.length; i++) {
          if (isPaused) return;
          
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: modelResponses[i]
            }
          ]);
          
          setProgress(50 + (i + 1) / modelResponses.length * 50);
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Add final summary
        setMessages(prev => [
          ...prev,
          {
            role: 'system',
            content: `Analysis complete. Processed ${augmentedPrompts.length} prompts with fingerprint-based augmentation.`
          }
        ]);

      } catch (error) {
        console.error('Dataset analysis error:', error);
        toast.error('Failed to analyze dataset: ' + (error as Error).message);
      } finally {
        setIsLoading(false);
        setProgress(100);
      }
    };

    if (!isPaused) {
      analyzeDataset();
    }
  }, [config, fingerprint, isPaused]);

  return (
    <div className="space-y-4">
      <AnalysisProgress 
        phase={currentPhase}
        progress={progress}
        isPaused={isPaused}
      />
      <Card className="p-4">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </Card>
    </div>
  );
};