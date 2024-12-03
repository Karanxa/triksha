import { ChatMessages } from "@/components/llm-scanner/chat/ChatMessages";
import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { Card, CardContent } from "@/components/ui/card";

interface ModelInteractionProps {
  messages: Message[];
  isLoading: boolean;
}

export const ModelInteraction = ({ messages, isLoading }: ModelInteractionProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Model Analysis</h3>
        <ChatMessages messages={messages} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};