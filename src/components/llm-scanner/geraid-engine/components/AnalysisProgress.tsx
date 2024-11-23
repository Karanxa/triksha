import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  phase: 'fingerprinting' | 'dataset_analysis';
  progress: number;
}

export const AnalysisProgress = ({ phase, progress }: AnalysisProgressProps) => {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Phase: {phase === 'fingerprinting' ? 'Model Fingerprinting' : 'Dataset Analysis'}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
};