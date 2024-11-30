import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { AnalysisProgress } from "./AnalysisProgress";
import { AnalysisChat } from "./AnalysisChat";
import { PromptList } from "./PromptList";
import { FingerPrintResult } from "@/components/llm-scanner/geraid-engine/types";
import { ApiKeys } from "@/integrations/supabase/types/common";
import { Json } from "@/integrations/supabase/types/common";

interface DatasetAnalysisProps {
  config: {
    datasetId: string;
    provider: string;
    model: string;
  };
  fingerprint: FingerPrintResult;
  isPaused: boolean;
  isStopped: boolean;
  lastPausedStep?: {
    phase: string;
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
  const [progress, setProgress] = useState(
    lastPausedStep?.phase === 'dataset_analysis' ? lastPausedStep.progress || 0 : 0
  );
  const [phase, setPhase] = useState<'augmenting' | 'testing'>('augmenting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [originalPrompts, setOriginalPrompts] = useState<string[]>([]);

  useEffect(() => {
    const analyzeDataset = async () => {
      if (isPaused || isStopped) return;
      
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: profile } = await supabase
          .from('profiles')
          .select('api_keys')
          .single();

        const apiKeys = profile?.api_keys as ApiKeys;
        if (!apiKeys?.openai) {
          throw new Error('OpenAI API key not found. Please add it in Settings.');
        }

        // Get dataset content
        const { data: dataset } = await supabase
          .from('datasets')
          .select('*')
          .eq('id', config.datasetId)
          .single();

        if (!dataset) throw new Error('Dataset not found');

        // Download and parse CSV
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path);

        if (downloadError) throw downloadError;

        const text = await fileData.text();
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        const headers = lines[0].toLowerCase().split(',');
        const promptIndex = headers.findIndex(header => 
          header === 'prompts' || header === 'prompt' || header === 'text' || header === 'original_prompt'
        );

        if (promptIndex === -1) {
          throw new Error('No prompt column found in dataset');
        }

        const prompts = lines.slice(1)
          .map(line => {
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const cleanedValues = values.map(val => val.replace(/^"|"$/g, '').trim());
            return cleanedValues[promptIndex];
          })
          .filter(Boolean);

        setOriginalPrompts(prompts);
        setMessages([{
          role: 'system',
          content: `Starting dataset analysis for ${config.model} with ${prompts.length} prompts identified`
        }]);

        // Process dataset with fingerprint results and test with target model
        const { data: analysisData, error } = await supabase.functions.invoke('process-geraide-scan', {
          body: {
            datasetId: config.datasetId,
            provider: config.provider,
            model: config.model,
            fingerprint,
            startFromProgress: lastPausedStep?.progress || 0
          }
        });

        if (error) throw error;

        // Update messages and progress as prompts are processed
        setPhase('testing');
        
        analysisData.results.forEach((result: any) => {
          setMessages(prev => [
            ...prev,
            { 
              role: 'system', 
              content: `Processing prompt: ${result.originalPrompt}`
            },
            { 
              role: 'assistant', 
              content: `Augmented prompt: ${result.augmentedPrompt}`
            },
            { 
              role: 'user', 
              content: `Testing with ${config.model}...`
            },
            { 
              role: 'assistant', 
              content: `Model response: ${result.modelResponse}`
            }
          ]);
        });

        if (isStopped) {
          setMessages(prev => [...prev, { 
            role: 'system', 
            content: 'Scan stopped manually by user' 
          }]);
          
          const scanData = {
            user_id: user.id,
            provider: config.provider,
            model: config.model,
            name: `Dataset Analysis - ${dataset.name}`,
            messages: messages as Json,
            fingerprint_results: fingerprint as unknown as Json,
            dataset_analysis_results: analysisData as Json,
            is_vulnerable: null,
            status: 'completed'
          };

          await supabase.from('geraide_scans').insert(scanData);
        }

      } catch (error) {
        console.error('Dataset analysis error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to analyze dataset');
      } finally {
        setIsLoading(false);
        setProgress(isStopped ? progress : 100);
      }
    };

    if (!isPaused && !isStopped) {
      analyzeDataset();
    }
  }, [config, fingerprint, isPaused, isStopped, lastPausedStep, messages, progress]);

  return (
    <div className="space-y-4">
      <AnalysisProgress progress={progress} phase={phase} isPaused={isPaused} />
      <PromptList prompts={originalPrompts} />
      <AnalysisChat messages={messages} isLoading={isLoading && !isPaused && !isStopped} />
    </div>
  );
};