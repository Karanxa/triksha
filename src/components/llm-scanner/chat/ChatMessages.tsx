import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from '../geraid-engine/types';
import { MessageBubble, ChatContainer } from './iMessageStyle';
import { TypingIndicator } from './TypingIndicator';
import { useAutoScroll } from '@/hooks/useAutoScroll';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const scrollRef = useAutoScroll([messages.length, isLoading]);

  return (
    <ChatContainer>
      <ScrollArea className="h-full pr-4">
        <div className="space-y-2" ref={scrollRef}>
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              content={message.content}
              isUser={message.role === 'user'}
              timestamp={new Date().toLocaleTimeString()}
            />
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      </ScrollArea>
    </ChatContainer>
  );
};