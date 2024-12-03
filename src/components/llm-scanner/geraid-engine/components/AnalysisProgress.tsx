import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  phase: 'fingerprinting' | 'dataset_analysis';
  progress: number;
}

export const AnalysisProgress = ({ phase, progress }: AnalysisProgressProps) => {
  const getPhaseLabel = () => {
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
          <Progress value={progress} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
};