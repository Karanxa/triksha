import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { AnalysisProgress } from "./AnalysisProgress";
import { ModelInteraction } from "./ModelInteraction";
import { FingerPrintResult } from "@/components/llm-scanner/geraid-engine/types";

interface DatasetAnalysisProps {
  config: {
    datasetId: string;
    provider: string;
    model: string;
  };
  fingerprint: FingerPrintResult;
  isPaused: boolean;
  isStopped: boolean;
  scanId: string | null;
}

// Define the shape of the API keys object
interface ProfileApiKeys {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  huggingface?: string;
  github?: string;
  ollama_endpoint?: string;
}

export const DatasetAnalysis = ({ 
  config, 
  fingerprint, 
  isPaused,
  isStopped,
  scanId 
}: DatasetAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'augmenting' | 'testing'>('augmenting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [augmentedPrompts, setAugmentedPrompts] = useState<string[]>([]);

  // Process a single prompt and wait for response
  const processPrompt = async (prompt: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data: response } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider: config.provider,
          model: config.model,
          prompt,
          scanId
        }
      });

      if (!response) throw new Error('No response received');

      setMessages(prev => [
        ...prev,
        { role: 'user', content: prompt },
        { role: 'assistant', content: response.response }
      ]);

      return true;
    } catch (error) {
      console.error('Error processing prompt:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process prompt');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch and augmentation
  useEffect(() => {
    const augmentDataset = async () => {
      if (!analysisData && !isPaused && !isStopped) {
        try {
          setIsLoading(true);
          
          // First get the user's OpenAI API key with proper typing
          const { data: profile } = await supabase
            .from('profiles')
            .select('api_keys')
            .single();

          const apiKeys = profile?.api_keys as ProfileApiKeys;
          if (!apiKeys?.openai) {
            throw new Error('OpenAI API key not found. Please add it in Settings.');
          }

          // Add initial system message with fingerprint analysis
          setMessages([{
            role: 'system',
            content: `Starting model analysis with fingerprint results:
- Capabilities: ${fingerprint.capabilities || 'Not detected'}
- Boundaries: ${fingerprint.boundaries || 'Not detected'}
- Safety measures: ${fingerprint.safety || 'Not detected'}

Beginning dataset augmentation based on model characteristics...`
          }]);

          // Process dataset with fingerprint analysis
          const { data, error } = await supabase.functions.invoke('process-geraid-scan', {
            body: {
              datasetId: config.datasetId,
              provider: config.provider,
              model: config.model,
              fingerprint: {
                capabilities: fingerprint.capabilities || '',
                boundaries: fingerprint.boundaries || '',
                safety: fingerprint.safety || ''
              },
              scanId
            }
          });

          if (error) throw error;
          
          setAnalysisData(data);
          setTotalPrompts(data?.results?.length || 0);
          
          // Store augmented prompts
          const augmentedPrompts = data?.results?.map((r: any) => r.augmentedPrompt) || [];
          setAugmentedPrompts(augmentedPrompts);
          
          // Update augmentation progress
          const augmentationProgress = Math.round((data?.results?.length || 0) / (data?.total || 1) * 100);
          setProgress(augmentationProgress);
          
          // Only move to testing phase when augmentation is complete
          if (augmentationProgress === 100) {
            setMessages(prev => [
              ...prev,
              { 
                role: 'system', 
                content: 'Dataset augmentation complete. Beginning model response testing...' 
              }
            ]);
            
            setPhase('testing');
            setProgress(0); // Reset progress for testing phase
            
            // Start processing the first prompt
            if (augmentedPrompts.length > 0) {
              const success = await processPrompt(augmentedPrompts[0]);
              if (success) {
                setCurrentQuestionIndex(1);
                setProgress((1 / augmentedPrompts.length) * 100);
              }
            }
          }
        } catch (error) {
          console.error('Dataset analysis error:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to analyze dataset');
        } finally {
          setIsLoading(false);
        }
      }
    };

    augmentDataset();
  }, [config, fingerprint, isPaused, isStopped, scanId]);

  // Process next prompt when previous is complete
  useEffect(() => {
    const processNextPrompt = async () => {
      if (!augmentedPrompts.length || 
          isPaused || 
          isStopped || 
          isLoading || 
          currentQuestionIndex >= augmentedPrompts.length ||
          phase !== 'testing') {
        return;
      }

      const prompt = augmentedPrompts[currentQuestionIndex];
      const success = await processPrompt(prompt);
      
      if (success) {
        const newProgress = ((currentQuestionIndex + 1) / totalPrompts) * 100;
        setProgress(Math.min(newProgress, 100));
        setCurrentQuestionIndex(prev => prev + 1);
      }
    };

    if (!isLoading && currentQuestionIndex < totalPrompts) {
      processNextPrompt();
    }
  }, [currentQuestionIndex, augmentedPrompts, isPaused, isStopped, isLoading, totalPrompts, phase]);

  return (
    <div className="space-y-4">
      <AnalysisProgress progress={progress} phase={phase} isPaused={isPaused} />
      <ModelInteraction messages={messages} isLoading={isLoading} />
    </div>
  );
};