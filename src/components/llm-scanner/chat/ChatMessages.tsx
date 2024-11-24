import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Message } from '../geraid-engine/types';
import { ChatMessage } from './ChatMessage';
import { useAutoScroll } from '@/hooks/useAutoScroll';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const scrollRef = useAutoScroll([messages.length, isLoading]);

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4 pb-4"> {/* Added pb-4 for bottom padding */}
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            scrollRef={index === messages.length - 1 ? scrollRef : undefined}
          />
        ))}
        {isLoading && (
          <div className="flex justify-center py-2"> {/* Added py-2 for loading indicator spacing */}
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};