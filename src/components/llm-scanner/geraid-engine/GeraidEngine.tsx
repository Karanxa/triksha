import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModelSelector } from "./ModelSelector";
import { ChatMessages } from "./ChatMessages";
import { Message, GeraidConfig } from "./types";

const questions = [
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
  const [isStarted, setIsStarted] = useState(false);
  const [isFingerprinting, setIsFingerprinting] = useState(true);

  const startAnalysis = async (newConfig: GeraidConfig) => {
    setIsStarted(true);
    setConfig(newConfig);
    setMessages([
      {
        role: 'system',
        content: `Starting Geraid-Engine analysis for ${newConfig.model}`
      }
    ]);
    await askNextQuestion();
  };

  const askNextQuestion = async () => {
    if (!config) return;
    
    if (currentStep >= questions.length) {
      if (isFingerprinting) {
        setIsFingerprinting(false);
        await processDataset();
      }
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider: config.provider,
          model: config.model,
          prompt: questions[currentStep]
        }
      });

      if (error) throw error;

      setMessages(prev => [
        ...prev,
        { role: 'user', content: questions[currentStep] },
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

  const processDataset = async () => {
    if (!config?.datasetId) return;

    setIsLoading(true);
    try {
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
      const lines = text.split('\n').filter(Boolean);

      // Process dataset with model responses
      setMessages(prev => [
        ...prev,
        { 
          role: 'system', 
          content: `Processing dataset: ${dataset.name} with ${lines.length} prompts` 
        }
      ]);

      // Process each prompt through the model
      for (const line of lines) {
        const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
          body: {
            provider: config.provider,
            model: config.model,
            prompt: line
          }
        });

        if (error) throw error;

        setMessages(prev => [
          ...prev,
          { role: 'user', content: line },
          { role: 'assistant', content: data.response }
        ]);
      }

      toast.success("Dataset processing complete");
    } catch (error: any) {
      console.error('Error processing dataset:', error);
      toast.error(error.message || "Failed to process dataset");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isStarted) {
    return <ModelSelector onStart={startAnalysis} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Geraid-Engine</h3>
          <ChatMessages messages={messages} isLoading={isLoading} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={isFingerprinting ? askNextQuestion : processDataset}
          disabled={isLoading || (!isFingerprinting && !config?.datasetId)}
        >
          {isLoading ? "Processing..." : 
           isFingerprinting ? 
             currentStep >= questions.length ? 
               "Start Dataset Analysis" : 
               "Continue Analysis" :
             "Process Dataset"}
        </Button>
      </div>
    </div>
  );
};