import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { AnalysisProgress } from "./AnalysisProgress";
import { ModelInteraction } from "./ModelInteraction";
import { FingerPrintResult } from "@/components/llm-scanner/geraid-engine/types";
import { ApiKeys } from "@/integrations/supabase/types/common";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Fingerprint, ShieldAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [phase, setPhase] = useState<'fingerprinting' | 'redteaming'>('fingerprinting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const analyzeDataset = async () => {
      setIsLoading(true);
      try {
        // Get user's profile for API keys
        const { data: profile } = await supabase
          .from('profiles')
          .select('api_keys')
          .single();

        const apiKeys = profile?.api_keys as ApiKeys;
        if (!apiKeys?.openai) {
          throw new Error('OpenAI API key not found. Please add it in Settings.');
        }

        // Initial system message for fingerprinting phase
        setMessages([
          {
            role: 'system',
            content: `Starting model fingerprinting phase for ${config.model}`
          },
          {
            role: 'user',
            content: 'What are your core capabilities and primary functions?'
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

        // Update phase to red teaming and add transition message
        setPhase('redteaming');
        setMessages(prev => [
          ...prev,
          { 
            role: 'system', 
            content: "Fingerprinting phase complete. Starting red teaming phase with augmented prompts." 
          }
        ]);
        
        // Update messages and progress as prompts are processed
        analysisData.results.forEach((result: any) => {
          setMessages(prev => [
            ...prev,
            { role: 'user', content: result.augmentedPrompt },
            { role: 'assistant', content: result.modelResponse }
          ]);
        });

      } catch (error) {
        console.error('Dataset analysis error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to analyze dataset');
      } finally {
        setIsLoading(false);
        setProgress(100);
      }
    };

    analyzeDataset();
  }, [config, fingerprint]);

  const renderPhaseInfo = () => {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {phase === 'fingerprinting' ? (
                <>
                  <Fingerprint className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Fingerprinting Phase</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Red Teaming Phase</span>
                </>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  {phase === 'fingerprinting' 
                    ? "We're analyzing the model's capabilities, boundaries, and safety measures to understand its behavior."
                    : "Using insights from fingerprinting, we're testing the model with augmented prompts to identify potential vulnerabilities. Please note that results may include false positives due to the early stage of our detection system."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {phase === 'fingerprinting'
              ? "Gathering information about the model's characteristics and limitations..."
              : "Testing model responses with context-aware prompts based on fingerprinting results..."}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {renderPhaseInfo()}
      <AnalysisProgress progress={progress} phase={phase} />
      <ModelInteraction messages={messages} isLoading={isLoading} />
    </div>
  );
};