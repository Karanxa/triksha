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
    return content
      .replace(/([^>])\n\n/g, '$1<br><br>')
      .replace(/([^>])\n/g, '$1<br>');
  };

  const getMessageStyle = (role: Message['role']) => {
    switch (role) {
      case 'user':
        return 'bg-muted/50';
      case 'system':
        return 'bg-primary/5 border-primary/20';
      default:
        return 'bg-card';
    }
  };

  return (
    <div className="space-y-4" ref={scrollRef}>
      {messages.map((message, index) => (
        <Card 
          key={index} 
          className={`p-4 ${getMessageStyle(message.role)}`}
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
  );
};