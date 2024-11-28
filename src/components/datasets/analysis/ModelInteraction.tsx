import { ChatMessages } from "@/components/llm-scanner/chat/ChatMessages";
import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ModelInteractionProps {
  messages: Message[];
  isLoading: boolean;
  onStartAnalysis?: () => void;
}

export const ModelInteraction = ({ messages, isLoading, onStartAnalysis }: ModelInteractionProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Model Analysis</h3>
        <ChatMessages messages={messages} isLoading={isLoading} />
        {messages.length === 0 && onStartAnalysis && (
          <Button 
            onClick={onStartAnalysis}
            className="w-full mt-4"
            disabled={isLoading}
          >
            Start Analysis
          </Button>
        )}
      </CardContent>
    </Card>
  );
};