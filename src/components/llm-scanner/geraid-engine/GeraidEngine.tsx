import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModelSelector } from "./ModelSelector";
import { ChatMessages } from "./ChatMessages";
import { Message, GeraidConfig, Phase, FingerPrintResult } from "./types";

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
  const [config, setConfig] = useState<GeraidConfig | null>(null);
  const [phase, setPhase] = useState<Phase>('not_started');
  const [fingerprintResults, setFingerprintResults] = useState<FingerPrintResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const startAnalysis = async (newConfig: GeraidConfig) => {
    setPhase('fingerprinting');
    setConfig(newConfig);
    setMessages([
      {
        role: 'system',
        content: `Starting Geraid-Engine fingerprinting phase for ${newConfig.model}`
      }
    ]);
    await processNextQuestion();
  };

  const processNextQuestion = async () => {
    if (!config || currentQuestionIndex >= FINGERPRINTING_QUESTIONS.length) {
      return;
    }

    setIsLoading(true);
    const question = FINGERPRINTING_QUESTIONS[currentQuestionIndex];

    // Add the question to messages immediately
    setMessages(prev => [...prev, { role: 'user', content: question }]);

    try {
      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider: config.provider,
          model: config.model,
          prompt: question
        }
      });

      if (error) throw error;

      // Add the response after a small delay to simulate natural conversation
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        
        // Store response in results
        const results: FingerPrintResult = fingerprintResults || {
          capabilities: '',
          boundaries: '',
          training: '',
          languages: '',
          safety: ''
        };

        // Map question to corresponding result key
        const questionKey = question.toLowerCase().includes('capabilities') ? 'capabilities'
          : question.toLowerCase().includes('ethical') ? 'boundaries'
          : question.toLowerCase().includes('training') ? 'training'
          : question.toLowerCase().includes('languages') ? 'languages'
          : 'safety';

        results[questionKey] = data.response;
        setFingerprintResults(results);

        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setIsLoading(false);

        // If this was the last question, add completion message
        if (currentQuestionIndex === FINGERPRINTING_QUESTIONS.length - 1) {
          setMessages(prev => [
            ...prev,
            {
              role: 'system',
              content: 'Fingerprinting phase complete. Click "Continue Analysis" to proceed with dataset analysis.'
            }
          ]);
        } else {
          // Process next question after a short delay
          setTimeout(() => {
            processNextQuestion();
          }, 1000);
        }
      }, 500);

    } catch (error: any) {
      console.error('Error in fingerprinting:', error);
      toast.error(error.message || "Failed to process question");
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

      // Process each prompt
      for (const prompt of prompts) {
        // TODO: Implement prompt augmentation based on fingerprint results
        const augmentedPrompt = prompt; // This will be enhanced in the next iteration
        
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

  if (phase === 'not_started') {
    return <ModelSelector onStart={startAnalysis} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">
            Geraid-Engine Analysis - {phase === 'fingerprinting' ? 'Phase 1: Fingerprinting' : 'Phase 2: Dataset Analysis'}
          </h3>
          <ChatMessages messages={messages} isLoading={isLoading} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {phase === 'fingerprinting' && !isLoading && fingerprintResults && currentQuestionIndex === FINGERPRINTING_QUESTIONS.length && (
          <Button
            onClick={startDatasetAnalysis}
          >
            Continue Analysis
          </Button>
        )}
      </div>
    </div>
  );
};