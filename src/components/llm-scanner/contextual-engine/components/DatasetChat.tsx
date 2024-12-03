import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { TypingIndicator } from "../../chat/TypingIndicator";
import { useApiKeys } from "../hooks/useApiKeys";
import { processModelRequest } from "../services/modelService";
import { DatasetChatProps, Message } from "../types/dataset-chat";
import { ChatMessage } from "./ChatMessage";

export const DatasetChat = ({ 
  config, 
  fingerprint,
  isPaused, 
  isStopped,
  onProgress 
}: DatasetChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [prompts, setPrompts] = useState<string[]>([]);
  const { apiKeys, isLoading: isLoadingKeys } = useApiKeys();

  // Process prompts
  useEffect(() => {
    const processNextPrompt = async () => {
      if (isPaused || isStopped || isLoading || currentPromptIndex >= prompts.length || !apiKeys || isLoadingKeys) {
        return;
      }

      setIsLoading(true);
      const prompt = prompts[currentPromptIndex];

      try {
        const providerKey = config.provider.toLowerCase() as keyof typeof apiKeys;
        const apiKey = apiKeys[providerKey];
        
        const data = await processModelRequest(
          config.provider,
          config.model,
          prompt,
          apiKey,
          config.customEndpoint
        );

        setMessages(prev => [
          ...prev,
          { role: 'user', content: prompt, timestamp: new Date().toISOString() },
          { role: 'assistant', content: data.response, timestamp: new Date().toISOString() }
        ]);

        const progress = Math.round(((currentPromptIndex + 1) / prompts.length) * 100);
        onProgress(progress);

        setCurrentPromptIndex(prev => prev + 1);
      } catch (error) {
        console.error('Error processing prompt:', error);
        toast.error('Failed to process prompt');
        
        setMessages(prev => [...prev, { 
          role: 'system', 
          content: `Error: ${error instanceof Error ? error.message : 'Failed to process prompt'}`,
          timestamp: new Date().toISOString()
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(processNextPrompt, 1000);
    return () => clearTimeout(timer);
  }, [currentPromptIndex, isPaused, isStopped, prompts.length, config, isLoading, apiKeys, isLoadingKeys]);

  return (
    <Card className="p-4">
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && !isPaused && !isStopped && <TypingIndicator />}
        </div>
      </ScrollArea>
    </Card>
  );
};