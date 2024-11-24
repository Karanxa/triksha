import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Message } from '../geraid-engine/types';
import { MessageBubble, ChatContainer } from './iMessageStyle';
import { useAutoScroll } from '@/hooks/useAutoScroll';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const scrollRef = useAutoScroll([messages.length, isLoading]);

  return (
    <ChatContainer>
      <ScrollArea className="h-full pr-4" ref={scrollRef}>
        <div className="space-y-2">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              content={message.content}
              isUser={message.role === 'user'}
              timestamp={new Date().toLocaleTimeString()}
            />
          ))}
          {isLoading && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </ScrollArea>
    </ChatContainer>
  );
};