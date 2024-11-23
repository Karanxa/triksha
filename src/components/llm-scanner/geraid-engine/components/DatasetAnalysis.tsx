import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessages } from "../../chat/ChatMessages";
import { AnalysisProgress } from "./AnalysisProgress";
import { useDatasetAnalysis } from "../hooks/useDatasetAnalysis";
import { FingerPrintResult } from "../types";
import { toast } from "sonner";
import { augmentPrompt } from "../utils/promptAugmentation";
import { Message } from "../types";
import { supabase } from "@/integrations/supabase/client";

interface DatasetAnalysisProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
  };
  fingerprint: FingerPrintResult;
}

export const DatasetAnalysis = ({ config, fingerprint }: DatasetAnalysisProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [prompts, setPrompts] = useState<string[]>([]);

  useEffect(() => {
    const fetchDataset = async () => {
      const { data: dataset, error } = await supabase
        .from('datasets')
        .select('metadata')
        .eq('id', config.datasetId)
        .single();

      if (error) {
        toast.error('Failed to fetch dataset');
        return;
      }

      if (!dataset?.metadata?.prompts) {
        toast.error('No prompts found in dataset');
        return;
      }

      // Augment all prompts based on fingerprint results
      const augmentedPrompts = await Promise.all(
        dataset.metadata.prompts.map((prompt: string) => 
          augmentPrompt(prompt, fingerprint)
        )
      );

      setPrompts(augmentedPrompts);
      setMessages([{
        role: 'system',
        content: `Starting dataset analysis for ${config.model} using fingerprint results. Found ${augmentedPrompts.length} prompts to process.`
      }]);
    };

    fetchDataset();
  }, [config.datasetId, fingerprint]);

  useEffect(() => {
    const processNextPrompt = async () => {
      if (currentPromptIndex >= prompts.length || isLoading) return;

      setIsLoading(true);
      const prompt = prompts[currentPromptIndex];

      try {
        // Add user message
        setMessages(prev => [...prev, {
          role: 'user',
          content: prompt
        }]);

        // Send to model
        const response = await supabase.functions.invoke('geraide-fingerprint', {
          body: {
            provider: config.provider,
            model: config.model,
            prompt
          }
        });

        if (response.error) throw response.error;

        // Add model response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.response
        }]);

        // Update progress
        const newProgress = Math.round(((currentPromptIndex + 1) / prompts.length) * 100);
        setProgress(newProgress);
        
        // Move to next prompt
        setCurrentPromptIndex(prev => prev + 1);
      } catch (error) {
        toast.error(`Error processing prompt: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    // Process next prompt if available
    if (prompts.length > 0 && currentPromptIndex < prompts.length) {
      processNextPrompt();
    }
  }, [currentPromptIndex, prompts, config, isLoading]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Dataset Analysis</h3>
          <AnalysisProgress phase="dataset_analysis" progress={progress} />
          <ChatMessages messages={messages} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};