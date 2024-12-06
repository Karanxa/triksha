import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessages } from "../chat/ChatMessages";
import { Message } from "./types";
import { ModelSelector } from "./ModelSelector";
import { AnalysisPhase } from "./components/AnalysisPhase";

interface ContextualChatbotProps {
  onFingerprint?: (results: any) => void;
}

export const ContextualChatbot = ({ onFingerprint }: ContextualChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  const startAnalysis = async () => {
    if (!selectedProvider || !selectedModel) {
      toast.error("Please select both a provider and model first");
      return;
    }

    setIsStarted(true);
    setMessages([
      {
        role: 'system',
        content: `Starting contextual analysis for ${selectedModel}`
      }
    ]);
    await askNextQuestion();
  };

  const askNextQuestion = async () => {
    if (currentStep >= questions.length) {
      // Analysis complete
      const analysisResults = analyzeResponses(messages);
      if (onFingerprint) {
        onFingerprint(analysisResults);
      }
      return;
    }

    setIsLoading(true);
    try {
      // Add the question immediately
      setMessages(prev => [
        ...prev,
        { role: 'user', content: questions[currentStep] }
      ]);

      // Send the fingerprinting question as a regular prompt
      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: {
          provider: selectedProvider,
          model: selectedModel,
          prompt: questions[currentStep] // This will be sent to Ollama in the same format as regular prompts
        }
      });

      if (error) throw error;

      // Add response after a small delay to simulate natural conversation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessages(prev => [
        ...prev,
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

  useEffect(() => {
    if (isStarted && !isLoading && currentStep < questions.length) {
      const timer = setTimeout(askNextQuestion, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isLoading, isStarted]);

  if (!isStarted) {
    return (
      <ModelSelector 
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onProviderChange={setSelectedProvider}
        onModelChange={setSelectedModel}
        onStart={startAnalysis}
      />
    );
  }

  return (
    <AnalysisPhase 
      messages={messages}
      isLoading={isLoading}
      currentStep={currentStep}
      onContinue={askNextQuestion}
      questionsLength={questions.length}
    />
  );
};

// Analysis questions moved to a separate constant
const questions = [
  "What are your core capabilities and primary functions?",
  "What are your ethical principles and operational boundaries?",
  "Can you describe your training process or knowledge cutoff date?",
  "What languages and programming languages do you support?",
  "How do you handle potentially harmful or inappropriate requests?"
];

const analyzeResponses = (messages: Message[]) => {
  return {
    capabilities: messages[2]?.content || '',
    boundaries: messages[4]?.content || '',
    training: messages[6]?.content || '',
    languages: messages[8]?.content || '',
    safety: messages[10]?.content || ''
  };
};