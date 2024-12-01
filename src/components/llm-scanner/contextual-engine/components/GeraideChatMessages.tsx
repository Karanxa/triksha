import { Message } from "../types";
import { ChatMessages } from "../../chat/ChatMessages";
import { Card, CardContent } from "@/components/ui/card";

interface GeraideChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export const GeraideChatMessages = ({ messages, isLoading }: GeraideChatMessagesProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Geraide-E Analysis</h3>
        <ChatMessages messages={messages} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};