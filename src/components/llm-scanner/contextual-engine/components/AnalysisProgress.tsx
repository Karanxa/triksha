import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  phase: 'fingerprinting' | 'dataset_analysis';
  progress: number;
  isPaused?: boolean;
}

export const AnalysisProgress = ({ phase, progress, isPaused }: AnalysisProgressProps) => {
  const getPhaseLabel = () => {
    if (isPaused) return "Scan paused";
    
    switch (phase) {
      case 'fingerprinting':
        return 'Fingerprinting model...';
      case 'dataset_analysis':
        return 'Analyzing dataset...';
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