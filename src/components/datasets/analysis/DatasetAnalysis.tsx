import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { AnalysisProgress } from "./AnalysisProgress";
import { ModelInteraction } from "./ModelInteraction";
import { FingerPrintResult } from "@/components/llm-scanner/geraid-engine/types";
import { useDatasetProcessing } from "./hooks/useDatasetProcessing";
import { ProfileApiKeys } from "@/components/datasets/analysis/types";

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

export const DatasetAnalysis = ({ 
  config, 
  fingerprint, 
  isPaused,
  isStopped,
  scanId 
}: DatasetAnalysisProps) => {
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    progress,
    setProgress,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    analysisData,
    setAnalysisData,
    totalPrompts,
    setTotalPrompts,
    augmentedPrompts,
    setAugmentedPrompts,
    processPrompt
  } = useDatasetProcessing();

  useEffect(() => {
    const augmentDataset = async () => {
      if (!analysisData && !isPaused && !isStopped) {
        try {
          setIsLoading(true);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('api_keys')
            .single();

          const apiKeys = profile?.api_keys as ProfileApiKeys;
          if (!apiKeys?.openai) {
            throw new Error('OpenAI API key not found. Please add it in Settings.');
          }

          setMessages([{
            role: 'system',
            content: `Starting model analysis with fingerprint results:
- Capabilities: ${fingerprint.capabilities || 'Not detected'}
- Boundaries: ${fingerprint.boundaries || 'Not detected'}`
          }]);

          const { data, error } = await supabase.functions.invoke('process-geraide-scan', {
            body: {
              datasetId: config.datasetId,
              provider: config.provider,
              model: config.model,
              fingerprint: {
                capabilities: fingerprint.capabilities || '',
                boundaries: fingerprint.boundaries || ''
              },
              scanId
            }
          });

          if (error) throw error;
          
          setAnalysisData(data);
          setTotalPrompts(data?.results?.length || 0);
          
          const augmentedPrompts = data?.results?.map((r: any) => r.augmentedPrompt) || [];
          setAugmentedPrompts(augmentedPrompts);
          
          const augmentationProgress = Math.round((data?.results?.length || 0) / (data?.total || 1) * 100);
          setProgress(augmentationProgress);
          
          if (augmentationProgress === 100) {
            setMessages(prev => [
              ...prev,
              { 
                role: 'system', 
                content: 'Dataset augmentation complete. Beginning model response testing...' 
              }
            ]);
            
            setProgress(0);
            
            if (augmentedPrompts.length > 0) {
              const success = await processPrompt(augmentedPrompts[0], scanId);
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

  useEffect(() => {
    const processNextPrompt = async () => {
      if (!augmentedPrompts.length || 
          isPaused || 
          isStopped || 
          isLoading || 
          currentQuestionIndex >= augmentedPrompts.length) {
        return;
      }

      const prompt = augmentedPrompts[currentQuestionIndex];
      const success = await processPrompt(prompt, scanId);
      
      if (success) {
        const newProgress = ((currentQuestionIndex + 1) / totalPrompts) * 100;
        setProgress(Math.min(newProgress, 100));
        setCurrentQuestionIndex(prev => prev + 1);
      }
    };

    processNextPrompt();
  }, [currentQuestionIndex, augmentedPrompts, isPaused, isStopped, isLoading, totalPrompts]);

  return (
    <div className="space-y-4">
      <AnalysisProgress progress={progress} phase={currentQuestionIndex === 0 ? 'augmenting' : 'testing'} isPaused={isPaused} />
      <ModelInteraction messages={messages} isLoading={isLoading} />
    </div>
  );
};