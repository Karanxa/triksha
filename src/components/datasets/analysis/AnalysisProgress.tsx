import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  progress: number;
  phase: 'augmenting' | 'testing';
  isPaused?: boolean;
}

export const AnalysisProgress = ({ progress, phase, isPaused }: AnalysisProgressProps) => {
  const getPhaseLabel = () => {
    if (isPaused) return "Analysis paused";
    
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
      <Progress 
        value={progress} 
        className={`w-full ${isPaused ? "opacity-50" : ""}`} 
      />
    </div>
  );
};