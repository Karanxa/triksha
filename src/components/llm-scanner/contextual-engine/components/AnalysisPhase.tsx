import { Card, CardContent } from "@/components/ui/card";
import { ChatMessages } from "../../chat/ChatMessages";
import { Message, ScanPhase } from "../types/phases";
import { ChatControls } from "./ChatControls";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, ShieldAlert, Wand2 } from "lucide-react";

interface AnalysisPhaseProps {
  messages: Message[];
  isLoading: boolean;
  currentStep: number;
  questionsLength: number;
  phase: ScanPhase;
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
  const getPhaseIcon = () => {
    switch (phase) {
      case 'fingerprinting':
        return <Fingerprint className="h-4 w-4" />;
      case 'augmenting':
        return <Wand2 className="h-4 w-4" />;
      case 'redteaming':
        return <ShieldAlert className="h-4 w-4" />;
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'fingerprinting':
        return "secondary";
      case 'augmenting':
        return "default";
      case 'redteaming':
        return "destructive";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Contextual Analysis</h3>
        <Badge 
          variant={getPhaseColor()}
          className="flex items-center gap-2"
        >
          {getPhaseIcon()}
          {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase
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