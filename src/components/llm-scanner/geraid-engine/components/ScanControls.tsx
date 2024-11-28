import { Button } from "@/components/ui/button";
import { PauseCircle, PlayCircle, StopCircle } from "lucide-react";
import { toast } from "sonner";

interface ScanControlsProps {
  phase: string;
  isPaused: boolean;
  onPauseResume: () => void;
  onStop: () => void;
}

export const ScanControls = ({ phase, isPaused, onPauseResume, onStop }: ScanControlsProps) => {
  if (phase === "not_started") return null;

  return (
    <div className="flex justify-center gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPauseResume}
      >
        {isPaused ? (
          <PlayCircle className="h-4 w-4 mr-2" />
        ) : (
          <PauseCircle className="h-4 w-4 mr-2" />
        )}
        {isPaused ? "Resume" : "Pause"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={onStop}
      >
        <StopCircle className="h-4 w-4 mr-2" />
        Stop
      </Button>
    </div>
  );
};