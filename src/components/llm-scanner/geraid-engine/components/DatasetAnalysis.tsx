import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AnalysisProgress } from "./AnalysisProgress";
import { ChatMessages } from "../../chat/ChatMessages";
import { Message } from "../types";
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
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const analyzeDataset = async () => {
      setIsProcessing(true);
      setProgress(0);
      
      try {
        // Get user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('api_keys')
          .single();

        const apiKeys = profile?.api_keys as Record<string, string>;
        if (!apiKeys?.openai) {
          throw new Error('OpenAI API key not found. Please add it in Settings.');
        }

        // Add initial system message
        setMessages([{
          role: 'system',
          content: `Starting dataset analysis for ${config.model}`
        }]);

        // Get original prompts from dataset
        const { data: dataset } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (!dataset?.file_path) {
          throw new Error('Dataset file not found');
        }

        // Download and process CSV
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path);

        if (downloadError) throw downloadError;

        const text = await fileData.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const headers = lines[0].toLowerCase().split(',');
        const promptIndex = headers.findIndex(header => 
          header === 'prompts' || header === 'prompt' || header === 'text'
        );

        if (promptIndex === -1) {
          throw new Error('No prompt column found in CSV');
        }

        const originalPrompts = lines.slice(1)
          .map(line => {
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            return values[promptIndex]?.replace(/^"|"$/g, '').trim();
          })
          .filter(Boolean);

        setProgress(20);

        // Process each prompt
        for (let i = 0; i < originalPrompts.length; i++) {
          const originalPrompt = originalPrompts[i];
          
          // Add original prompt to chat
          setMessages(prev => [...prev, {
            role: 'user',
            content: `Original prompt: ${originalPrompt}`
          }]);

          // Get augmented prompt
          const augmentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKeys.openai}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [{
                role: 'system',
                content: `You are an expert in prompt engineering. Enhance this prompt while maintaining its core intent: ${originalPrompt}`
              }],
              temperature: 0.7,
            }),
          });

          if (!augmentResponse.ok) {
            throw new Error(`OpenAI API error: ${await augmentResponse.text()}`);
          }

          const augmentData = await augmentResponse.json();
          const augmentedPrompt = augmentData.choices[0].message.content;

          // Add augmented prompt to chat
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Enhanced prompt: ${augmentedPrompt}`
          }]);

          // Test with target model
          try {
            const { data: modelResponse, error: modelError } = await supabase.functions.invoke('scan-llm', {
              body: {
                prompts: [augmentedPrompt],
                provider: config.provider,
                model: config.model
              }
            });

            if (modelError) throw modelError;

            setMessages(prev => [...prev, {
              role: 'system',
              content: `Model response: ${modelResponse.results[0].model_response}`
            }]);
          } catch (error) {
            setMessages(prev => [...prev, {
              role: 'system',
              content: `Error testing prompt: ${error instanceof Error ? error.message : 'Unknown error'}`
            }]);
          }

          // Update progress
          setProgress(20 + Math.floor((i + 1) / originalPrompts.length * 80));
        }

        toast.success('Dataset analysis complete');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process dataset';
        toast.error(message);
        setMessages(prev => [...prev, {
          role: 'system',
          content: `Error: ${message}`
        }]);
      } finally {
        setIsProcessing(false);
        setProgress(100);
      }
    };

    analyzeDataset();
  }, [config, fingerprint]);

  return (
    <div className="space-y-4">
      <AnalysisProgress phase="dataset_analysis" progress={progress} />
      <Card className="p-4">
        <ChatMessages messages={messages} isLoading={isProcessing} />
      </Card>
    </div>
  );
};