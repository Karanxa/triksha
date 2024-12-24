import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  phase: 'fingerprinting' | 'redteaming';
  progress: number;
  isPaused?: boolean;
}

export const AnalysisProgress = ({ phase, progress, isPaused }: AnalysisProgressProps) => {
  const getPhaseLabel = () => {
    if (isPaused) return "Analysis paused";
    
    switch (phase) {
      case 'fingerprinting':
        return 'Model fingerprinting in progress...';
      case 'redteaming':
        return 'Red teaming analysis in progress...';
      default:
        return 'Processing...';
    }
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{getPhaseLabel()}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className={`w-full ${isPaused ? "opacity-50" : ""}`} 
          />
        </div>
      </CardContent>
    </Card>
  );
};