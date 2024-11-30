import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  phase: 'augmenting' | 'testing';
  progress: number;
  isPaused?: boolean;
}

export const AnalysisProgress = ({ phase, progress, isPaused }: AnalysisProgressProps) => {
  const getPhaseLabel = () => {
    if (isPaused) return "Analysis paused";
    
    switch (phase) {
      case 'augmenting':
        return 'Augmenting dataset...';
      case 'testing':
        return 'Testing model responses...';
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