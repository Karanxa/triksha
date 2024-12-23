import { Card, CardContent } from "@/components/ui/card";
import { ChatMessages } from "../../chat/ChatMessages";
import { Message } from "../types";
import { ChatControls } from "./ChatControls";

interface AnalysisPhaseProps {
  messages: Message[];
  isLoading: boolean;
  currentStep: number;
  questionsLength: number;
  isPaused?: boolean;
  onPauseResume: () => void;
  onContinue?: () => void; // Made optional with ?
}

export const AnalysisPhase = ({
  messages,
  isLoading,
  currentStep,
  questionsLength,
  isPaused = false,
  onPauseResume
}: AnalysisPhaseProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contextual Analysis</h3>
      
      <ChatControls 
        isPaused={isPaused}
        onPauseResume={onPauseResume}
        currentStep={currentStep}
        totalSteps={questionsLength}
      />
      
      <Card>
        <CardContent className="p-4">
          <ChatMessages messages={messages} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};