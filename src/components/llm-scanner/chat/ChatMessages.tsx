import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from '../geraid-engine/types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { useAutoScroll } from '@/hooks/useAutoScroll';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const scrollRef = useAutoScroll([messages.length, isLoading]);

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4 pb-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            scrollRef={index === messages.length - 1 ? scrollRef : undefined}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};