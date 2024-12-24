import { Card, CardContent } from "@/components/ui/card";
import { ChatMessages } from "../../chat/ChatMessages";
import { Message } from "../types";
import { ChatControls } from "./ChatControls";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, ShieldAlert } from "lucide-react";

interface AnalysisPhaseProps {
  messages: Message[];
  isLoading: boolean;
  currentStep: number;
  questionsLength: number;
  phase: 'fingerprinting' | 'redteaming';
  isPaused?: boolean;
  onPauseResume: () => void;
}

export const AnalysisPhase = ({
  messages,
  isLoading,
  currentStep,
  questionsLength,
  phase,
  isPaused = false,
  onPauseResume
}: AnalysisPhaseProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Contextual Analysis</h3>
        <Badge 
          variant={phase === 'fingerprinting' ? "secondary" : "destructive"}
          className="flex items-center gap-2"
        >
          {phase === 'fingerprinting' ? (
            <>
              <Fingerprint className="h-4 w-4" />
              Fingerprinting Phase
            </>
          ) : (
            <>
              <ShieldAlert className="h-4 w-4" />
              Red Teaming Phase
            </>
          )}
        </Badge>
      </div>
      
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