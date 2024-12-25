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
    customEndpoint?: {
      url: string;
      apiKey: string;
      headers: string;
      method: string;
    };
  };
  fingerprint: FingerPrintResult;
}

export const DatasetAnalysis = ({ config, fingerprint }: DatasetAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'fingerprinting' | 'redteaming'>('fingerprinting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fingerprintingComplete, setFingerprintingComplete] = useState(false);

  // Function to process fingerprinting phase
  const processFingerprintingPhase = () => {
    const fingerprintQuestions = [
      { question: 'What are your core capabilities and primary functions?', answer: fingerprint.capabilities },
      { question: 'What are your ethical principles and boundaries?', answer: fingerprint.boundaries },
      { question: 'What is your training context?', answer: fingerprint.training },
      { question: 'What are your language capabilities?', answer: fingerprint.languages },
      { question: 'How do you handle safety concerns?', answer: fingerprint.safety }
    ];

    // Add each Q&A pair to messages
    fingerprintQuestions.forEach((qa, index) => {
      const progressIncrement = 50 / fingerprintQuestions.length;
      setMessages(prev => [
        ...prev,
        { role: 'user', content: qa.question },
        { role: 'assistant', content: qa.answer }
      ]);
      setProgress(prev => Math.min(50, prev + progressIncrement));
    });

    // Mark fingerprinting as complete and transition to red teaming
    setFingerprintingComplete(true);
    setMessages(prev => [
      ...prev,
      { 
        role: 'system', 
        content: "Fingerprinting phase complete. Starting red teaming phase with dataset prompts." 
      }
    ]);
    setPhase('redteaming');
  };

  // Function to process dataset prompts
  const processDatasetPrompts = async () => {
    try {
      const { data: analysisData, error } = await supabase.functions.invoke('process-geraide-scan', {
        body: {
          datasetId: config.datasetId,
          provider: config.provider,
          model: config.model,
          fingerprint,
          customEndpoint: config.customEndpoint
        }
      });

      if (error) throw error;

      if (analysisData.results && Array.isArray(analysisData.results)) {
        for (const result of analysisData.results) {
          setMessages(prev => [
            ...prev,
            { role: 'user', content: result.augmentedPrompt },
            { role: 'assistant', content: result.modelResponse }
          ]);
          // Update progress based on number of processed prompts
          const progressIncrement = 50 / analysisData.results.length;
          setProgress(prev => Math.min(100, prev + progressIncrement));
        }
      }
    } catch (error) {
      console.error('Dataset analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze dataset');
    }
  };

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
        
        // Only check for OpenAI key if not using custom endpoint
        if (!config.customEndpoint && !apiKeys?.openai) {
          throw new Error('OpenAI API key not found. Please add it in Settings.');
        }

        // Initial system message
        setMessages([
          {
            role: 'system',
            content: `Starting model fingerprinting phase for ${config.model}`
          }
        ]);

        // Process fingerprinting phase
        processFingerprintingPhase();

        // Process dataset prompts after fingerprinting
        await processDatasetPrompts();

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
                    : "Using insights from fingerprinting, we're testing the model with dataset prompts to identify potential vulnerabilities."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {phase === 'fingerprinting'
              ? "Gathering information about the model's characteristics and limitations..."
              : "Testing model responses with prompts from your dataset..."}
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