import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from '../geraid-engine/types';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { Card } from "@/components/ui/card";
import { TypingIndicator } from './TypingIndicator';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const scrollRef = useAutoScroll([messages.length, isLoading]);

  const formatMessage = (content: string) => {
    // Format numbered sections with proper spacing and styling
    const formattedContent = content
      // Handle numbered lists with dots (e.g., "1. Title")
      .replace(/(\d+\.\s*)([A-Z][^:]+)(:?\s*)(.*)/g, (_, number, title, colon, description) => {
        return `
          <div class="mb-6">
            <div class="flex items-baseline gap-2">
              <span class="text-primary font-medium">${number}</span>
              <span class="text-primary font-medium">${title}</span>
            </div>
            ${description ? `<div class="mt-2 pl-6 text-card-foreground">${description}</div>` : ''}
          </div>
        `;
      })
      // Handle regular paragraphs
      .replace(/([^>])\n\n/g, '$1<br><br>')
      // Handle single line breaks
      .replace(/([^>])\n/g, '$1<br>');

    return formattedContent;
  };

  return (
    <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message, index) => (
          <Card 
            key={index} 
            className={`p-4 ${
              message.role === 'user' 
                ? 'bg-muted/50' 
                : message.role === 'system'
                ? 'bg-primary/5 border-primary/20'
                : 'bg-card'
            }`}
          >
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ 
                __html: formatMessage(message.content)
              }}
            />
          </Card>
        ))}
        {isLoading && <TypingIndicator />}
      </div>
    </ScrollArea>
  );
};