import { Message } from "../types";
import { Card } from "@/components/ui/card";
import { TypingIndicator } from "../../chat/TypingIndicator";

interface ContextualScanMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ContextualScanMessages = ({ messages, isLoading }: ContextualScanMessagesProps) => {
  return (
    <Card className="p-4">
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
            </div>
          </div>
        ))}
        {isLoading && <TypingIndicator />}
      </div>
    </Card>
  );
};