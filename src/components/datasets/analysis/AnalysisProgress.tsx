import { Progress } from "@/components/ui/progress";
import { Pause, Play } from "lucide-react";

interface AnalysisProgressProps {
  phase: "augmenting" | "testing";
  progress: number;
  isPaused: boolean;
}

export const AnalysisProgress = ({ phase, progress, isPaused }: AnalysisProgressProps) => {
  const getPhaseText = () => {
    switch (phase) {
      case "augmenting":
        return "Augmenting dataset prompts";
      case "testing":
        return "Testing augmented prompts";
      default:
        return "Processing";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {getPhaseText()}
          {isPaused && " (Paused)"}
        </span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      {isPaused && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Play className="h-4 w-4" />
          <span>Analysis paused</span>
        </div>
      )}
    </div>
  );
};