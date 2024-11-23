import { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessages } from "./ChatMessages";
import { useChat } from '../hooks/useChat';
import { ChatProps } from '../types/chat';

export const Chat = ({ config, onComplete }: ChatProps) => {
  const { state, processNextQuestion } = useChat();
  const { messages, isLoading, currentQuestionIndex, fingerprintResults } = state;

  useEffect(() => {
    const processQuestion = async () => {
      if (!config || isLoading) return;
      
      const success = await processNextQuestion(config.provider, config.model);
      
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