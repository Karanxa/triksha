import { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessages } from "../../chat/ChatMessages";
import { useChat } from '../hooks/useChat';
import { ChatProps } from '../types/chat';

export const Chat = ({ config, onComplete, onProgress }: ChatProps) => {
  const { state, processNextQuestion } = useChat();
  const { messages, isLoading, currentQuestionIndex, fingerprintResults } = state;

  useEffect(() => {
    const processQuestion = async () => {
      if (!config || isLoading) return;
      
      const success = await processNextQuestion(config.provider, config.model);
      
      // Calculate and report progress
      const totalQuestions = 5; // Total number of fingerprinting questions
      const progress = Math.round((currentQuestionIndex / totalQuestions) * 100);
      onProgress?.(progress);
      
      if (!success && fingerprintResults) {
        onComplete(fingerprintResults);
      }
    };

    // Start with a small delay to allow UI to render
    const timer = setTimeout(processQuestion, 500);
    return () => clearTimeout(timer);
  }, [config, currentQuestionIndex, isLoading]);

  if (!config) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Model Analysis</h3>
        <ChatMessages messages={messages} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};