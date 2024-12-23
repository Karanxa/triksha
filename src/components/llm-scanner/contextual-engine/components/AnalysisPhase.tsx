import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatMessages } from "../../chat/ChatMessages";
import { Message } from "../types";
import { Badge } from "@/components/ui/badge";
import { PauseCircle } from "lucide-react";

interface AnalysisPhaseProps {
  messages: Message[];
  isLoading: boolean;
  currentStep: number;
  questionsLength: number;
  onContinue: () => void;
  isPaused?: boolean;
}

export const AnalysisPhase = ({
  messages,
  isLoading,
  currentStep,
  questionsLength,
  onContinue,
  isPaused = false
}: AnalysisPhaseProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Contextual Analysis</h3>
        {isPaused && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <PauseCircle className="h-4 w-4" />
            Paused
          </Badge>
        )}
      </div>
      
      <Card>
        <CardContent className="p-4">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={isLoading || currentStep >= questionsLength || isPaused}
        >
          {currentStep >= questionsLength
            ? "Analysis Complete"
            : isPaused
            ? "Paused"
            : "Continue Analysis"}
        </Button>
      </div>
    </div>
  );
};