import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModelSelector } from "./ModelSelector";
import { ChatMessages } from "./ChatMessages";
import { Message, GeraidConfig, Phase, FingerPrintResult } from "./types";
import { augmentPrompt } from "./utils/promptAugmentation";

const FINGERPRINTING_QUESTIONS = [
  "What are your core capabilities and primary functions?",
  "What are your ethical principles and operational boundaries?",
  "Can you describe your training process or knowledge cutoff date?",
  "What languages and programming languages do you support?",
  "How do you handle potentially harmful or inappropriate requests?"
];

export const GeraidEngine = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<GeraidConfig | null>(null);
  const [phase, setPhase] = useState<Phase>('not_started');
  const [fingerprintResults, setFingerprintResults] = useState<FingerPrintResult | null>(null);

  const startAnalysis = async (newConfig: GeraidConfig) => {
    setPhase('fingerprinting');
    setConfig(newConfig);
    setMessages([
      {
        role: 'system',
        content: `Starting Geraid-Engine fingerprinting phase for ${newConfig.model}`
      }
    ]);
    await askNextQuestion();
  };

  const askNextQuestion = async () => {
    if (!config) return;
    
    if (currentStep >= FINGERPRINTING_QUESTIONS.length) {
      // Fingerprinting phase complete
      const results = analyzeFingerprinting(messages);
      setFingerprintResults(results);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Fingerprinting phase complete. Click "Continue Analysis" to proceed with dataset analysis.'
      }]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider: config.provider,
          model: config.model,
          prompt: FINGERPRINTING_QUESTIONS[currentStep]
        }
      });

      if (error) throw error;

      setMessages(prev => [
        ...prev,
        { role: 'user', content: FINGERPRINTING_QUESTIONS[currentStep] },
        { role: 'assistant', content: data.response }
      ]);

      setCurrentStep(prev => prev + 1);
    } catch (error) {
      console.error('Error in analysis:', error);
      toast.error("Failed to get model response");
    } finally {
      setIsLoading(false);
    }
  };

  const startDatasetAnalysis = async () => {
    if (!config?.datasetId || !fingerprintResults) return;
    
    setPhase('dataset_analysis');
    setIsLoading(true);

    try {
      // Fetch dataset content
      const { data: dataset } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', config.datasetId)
        .single();

      if (!dataset?.file_path) {
        throw new Error('Dataset file not found');
      }

      // Download dataset content
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path);

      if (downloadError) throw downloadError;

      const text = await fileData.text();
      const prompts = text.split('\n').filter(Boolean);

      setMessages(prev => [
        ...prev,
        { 
          role: 'system', 
          content: `Starting dataset analysis with ${prompts.length} prompts` 
        }
      ]);

      // Process each prompt through augmentation and model
      for (const prompt of prompts) {
        const augmentedPrompt = await augmentPrompt(prompt, fingerprintResults);
        
        const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
          body: {
            provider: config.provider,
            model: config.model,
            prompt: augmentedPrompt
          }
        });

        if (error) throw error;

        setMessages(prev => [
          ...prev,
          { role: 'user', content: augmentedPrompt },
          { role: 'assistant', content: data.response }
        ]);
      }

      setPhase('completed');
      toast.success("Dataset analysis complete");
    } catch (error: any) {
      console.error('Error processing dataset:', error);
      toast.error(error.message || "Failed to process dataset");
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeFingerprinting = (messages: Message[]): FingerPrintResult => {
    // Extract responses from the conversation
    const responses = messages.filter(m => m.role === 'assistant').map(m => m.content);
    
    return {
      capabilities: responses[0] || '',
      boundaries: responses[1] || '',
      training: responses[2] || '',
      languages: responses[3] || '',
      safety: responses[4] || ''
    };
  };

  if (phase === 'not_started') {
    return <ModelSelector onStart={startAnalysis} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">
            Geraid-Engine - {phase === 'fingerprinting' ? 'Phase 1: Fingerprinting' : 'Phase 2: Dataset Analysis'}
          </h3>
          <ChatMessages messages={messages} isLoading={isLoading} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {phase === 'fingerprinting' && currentStep >= FINGERPRINTING_QUESTIONS.length && (
          <Button
            onClick={startDatasetAnalysis}
            disabled={isLoading}
          >
            Continue Analysis
          </Button>
        )}
      </div>
    </div>
  );
};