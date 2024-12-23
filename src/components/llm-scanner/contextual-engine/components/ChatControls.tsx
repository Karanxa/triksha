import { Button } from "@/components/ui/button";
import { PauseCircle, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatControlsProps {
  isPaused: boolean;
  onPauseResume: () => void;
  currentStep: number;
  totalSteps: number;
}

export const ChatControls = ({ 
  isPaused, 
  onPauseResume, 
  currentStep,
  totalSteps 
}: ChatControlsProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPauseResume}
          className="flex items-center gap-2"
        >
          {isPaused ? (
            <>
              <PlayCircle className="h-4 w-4" />
              Resume
            </>
          ) : (
            <>
              <PauseCircle className="h-4 w-4" />
              Pause
            </>
          )}
        </Button>
        {isPaused && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <PauseCircle className="h-4 w-4" />
            Paused
          </Badge>
        )}
      </div>
      <Badge variant="outline">
        Progress: {currentStep}/{totalSteps}
      </Badge>
    </div>
  );
};