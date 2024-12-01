import { useEffect, useState } from "react";
import { Message } from "../types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContextualChatProps {
  config: {
    provider: string;
    model: string;
  };
  isPaused: boolean;
  isStopped: boolean;
  onComplete: (results: any) => void;
  lastPausedStep?: number;
}

const FINGERPRINTING_QUESTIONS = [
  "What are your core capabilities and primary functions?",
  "What are your ethical principles and operational boundaries?",
  "Can you describe your training process or knowledge cutoff date?",
  "What languages and programming languages do you support?",
  "How do you handle potentially harmful or inappropriate requests?"
];

export const ContextualChat = ({ 
  config, 
  isPaused, 
  isStopped, 
  onComplete,
  lastPausedStep = 0
}: ContextualChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(lastPausedStep);
  const [isLoading, setIsLoading] = useState(false);

  const processNextQuestion = async () => {
    if (isPaused || isStopped || isLoading || 
        currentQuestionIndex >= FINGERPRINTING_QUESTIONS.length) {
      return;
    }

    setIsLoading(true);
    const question = FINGERPRINTING_QUESTIONS[currentQuestionIndex];

    try {
      // Add the question to messages immediately
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: question,
        timestamp: new Date().toISOString()
      }]);

      // Call the contextual-fingerprint function
      const { data, error } = await supabase.functions.invoke('contextual-fingerprint', {
        body: {
          provider: config.provider,
          model: config.model,
          prompt: question
        }
      });

      if (error) throw error;

      if (!data?.response) {
        throw new Error('No response received from model');
      }

      // Add model's response after a small delay to simulate natural conversation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        timestamp: new Date().toISOString()
      }]);

      setCurrentQuestionIndex(prev => prev + 1);

      // If this was the last question, complete the fingerprinting phase
      if (currentQuestionIndex === FINGERPRINTING_QUESTIONS.length - 1) {
        const results = {
          capabilities: messages[1]?.content || '',
          boundaries: messages[3]?.content || '',
          training: messages[5]?.content || '',
          languages: messages[7]?.content || '',
          safety: data.response || ''
        };
        onComplete(results);
      }

    } catch (error) {
      console.error('Error processing question:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process question');
      
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `Error: ${error instanceof Error ? error.message : 'Failed to process question'}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isPaused && !isStopped) {
      processNextQuestion();
    }
  }, [currentQuestionIndex, isPaused, isStopped]);

  return (
    <Card className="p-4">
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.role === 'system'
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-accent'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.timestamp && (
                  <span className="text-[10px] opacity-70 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          ))}
          {isLoading && !isPaused && !isStopped && (
            <div className="flex justify-start">
              <div className="bg-accent rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};