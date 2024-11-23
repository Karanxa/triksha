import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModelSelector } from "./ModelSelector";
import { ChatMessages } from "./ChatMessages";
import { Message } from "./types";

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
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  const startAnalysis = async (provider: string, model: string) => {
    setIsStarted(true);
    setSelectedProvider(provider);
    setSelectedModel(model);
    setMessages([
      {
        role: 'system',
        content: `Starting Geraid-Engine analysis for ${model}`
      }
    ]);
    await askNextQuestion();
  };

  const askNextQuestion = async () => {
    if (currentStep >= questions.length) {
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider: selectedProvider,
          model: selectedModel,
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

  if (!isStarted) {
    return (
      <Card>
        <CardContent className="p-6">
          <ModelSelector onStart={startAnalysis} />
        </CardContent>
      </Card>
    );
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
          onClick={askNextQuestion}
          disabled={isLoading || currentStep >= questions.length}
        >
          {currentStep >= questions.length
            ? "Analysis Complete"
            : "Continue Analysis"}
        </Button>
      </div>
    </div>
  );
};