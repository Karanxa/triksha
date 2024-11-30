import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  progress: number;
  phase: 'augmenting' | 'testing';
}

export const AnalysisProgress = ({ progress, phase }: AnalysisProgressProps) => {
  const getPhaseLabel = () => {
    switch (phase) {
      case 'augmenting':
        return 'Augmenting prompts...';
      case 'testing':
        return 'Testing with model...';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{getPhaseLabel()}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
};