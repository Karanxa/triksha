import { Message } from "@/components/llm-scanner/contextual-engine/types";
import { ChatMessages } from "@/components/llm-scanner/chat/ChatMessages";
import { Card, CardContent } from "@/components/ui/card";

interface AnalysisChatProps {
  messages: Message[];
  isLoading: boolean;
}

export const AnalysisChat = ({ messages, isLoading }: AnalysisChatProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Dataset Analysis</h3>
        <ChatMessages messages={messages} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};