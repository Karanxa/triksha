import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "../../chat/ChatMessages";
import { Message } from "../types";

interface AnalysisPhaseProps {
  messages: Message[];
  isLoading: boolean;
  currentStep: number;
  questionsLength: number;
  onContinue: () => void;
}

export const AnalysisPhase = ({
  messages,
  isLoading,
  currentStep,
  questionsLength,
  onContinue
}: AnalysisPhaseProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Contextual Analysis</h3>
          <ChatMessages messages={messages} isLoading={isLoading} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={isLoading || currentStep >= questionsLength}
        >
          {currentStep >= questionsLength
            ? "Analysis Complete"
            : "Continue Analysis"}
        </Button>
      </div>
    </div>
  );
};