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
  isPaused?: boolean;
}

export const ContextualChatbot = ({ onFingerprint, isPaused = false }: ContextualChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [pendingQuestion, setPendingQuestion] = useState<boolean>(false);

  const startAnalysis = async (analysisConfig: any) => {
    setIsStarted(true);
    setConfig(analysisConfig);
    setMessages([
      {
        role: 'system',
        content: `Starting contextual analysis for ${analysisConfig.model}`
      }
    ]);
    await askNextQuestion();
  };

  const askNextQuestion = async () => {
    if (!config || currentStep >= questions.length || isPaused) {
      if (currentStep >= questions.length) {
        // Analysis complete
        const analysisResults = analyzeResponses(messages);
        if (onFingerprint) {
          onFingerprint(analysisResults);
        }
      }
      return;
    }

    setIsLoading(true);
    setPendingQuestion(true);
    try {
      // Add the question
      const question = questions[currentStep];
      setMessages(prev => [...prev, { role: 'user', content: question }]);

      // Send the fingerprinting question
      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: {
          provider: config.provider,
          model: config.model,
          prompt: question,
          customEndpoint: config.customEndpoint
        }
      });

      if (error) throw error;

      // Add response after a small delay to simulate natural conversation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (data.response) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.response }
        ]);
        setCurrentStep(prev => prev + 1);
      } else {
        throw new Error('No response received from model');
      }
    } catch (error) {
      console.error('Error in analysis:', error);
      toast.error("Failed to get model response");
    } finally {
      setIsLoading(false);
      setPendingQuestion(false);
    }
  };

  useEffect(() => {
    if (isStarted && !isLoading && !isPaused && !pendingQuestion && currentStep < questions.length) {
      const timer = setTimeout(askNextQuestion, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isLoading, isStarted, isPaused, pendingQuestion]);

  if (!isStarted) {
    return <ModelSelector onStart={startAnalysis} />;
  }

  return (
    <AnalysisPhase 
      messages={messages}
      isLoading={isLoading}
      currentStep={currentStep}
      onContinue={askNextQuestion}
      questionsLength={questions.length}
      isPaused={isPaused}
    />
  );
};

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