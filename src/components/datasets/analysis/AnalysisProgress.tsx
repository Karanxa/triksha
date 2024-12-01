import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  progress: number;
  isPaused?: boolean;
  phase?: 'fingerprinting' | 'dataset_analysis';
}

export const AnalysisProgress = ({ progress, isPaused, phase = 'dataset_analysis' }: AnalysisProgressProps) => {
  const getPhaseLabel = () => {
    if (isPaused) return "Analysis paused";
    
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