import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pause } from "lucide-react";

interface AnalysisProgressProps {
  phase: 'fingerprinting' | 'dataset_analysis';
  progress: number;
  isPaused: boolean;
}

export const AnalysisProgress = ({ phase, progress, isPaused }: AnalysisProgressProps) => {
  const getPhaseLabel = () => {
    switch (phase) {
      case 'fingerprinting':
        return isPaused ? 'Fingerprinting paused...' : 'Fingerprinting model...';
      case 'dataset_analysis':
        return isPaused ? 'Analysis paused...' : 'Analyzing dataset...';
      default:
        return 'Processing...';
    }
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              {getPhaseLabel()}
              {isPaused && <Pause className="h-4 w-4" />}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};