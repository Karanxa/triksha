import { Message } from "../types";
import { ChatMessages } from "../../chat/ChatMessages";
import { Card, CardContent } from "@/components/ui/card";
import { useAutoScroll } from "@/hooks/useAutoScroll";

interface GeraideChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const GeraideChatMessages = ({ messages, isLoading }: GeraideChatMessagesProps) => {
  const scrollRef = useAutoScroll([messages.length, isLoading]);

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Geraide-E Analysis</h3>
        <div ref={scrollRef}>
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>
      </CardContent>
    </Card>
  );
};