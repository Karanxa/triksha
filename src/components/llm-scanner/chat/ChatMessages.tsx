import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from '../geraid-engine/types';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { MessageBubble, ChatContainer } from './iMessageStyle';
import { TypingIndicator } from './TypingIndicator';
import { Card } from "@/components/ui/card";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const scrollRef = useAutoScroll([messages.length, isLoading]);

  const formatMessage = (content: string) => {
    // Format numbered sections for better readability
    return content.replace(/(\d+\.\s*[A-Z\s]+)([\s\S]*?)(?=\d+\.|$)/g, (match, title, content) => {
      return `<div class="mb-4">
        <div class="font-semibold text-primary">${title}</div>
        <div class="pl-4 mt-1">${content.trim()}</div>
      </div>`;
    });
  };

  return (
    <ChatContainer>
      <ScrollArea className="h-full pr-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <Card key={index} className={`p-4 ${message.role === 'user' ? 'bg-muted' : 'bg-card'}`}>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatMessage(message.content)
                }}
              />
            </Card>
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      </ScrollArea>
    </ChatContainer>
  );
};