import { Message } from "../types";
import { Card } from "@/components/ui/card";
import { TypingIndicator } from "../../chat/TypingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContextualChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ContextualChatMessages = ({ messages, isLoading }: ContextualChatMessagesProps) => {
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
                      : 'bg-accent text-accent-foreground'
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
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-accent rounded-lg p-3">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};