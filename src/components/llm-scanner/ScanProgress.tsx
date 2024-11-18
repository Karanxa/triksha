import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ScanProgressProps {
  isScanning: boolean;
  progress: number;
}

export const ScanProgress = ({ isScanning, progress }: ScanProgressProps) => {
  if (!isScanning || progress === 0) return null;

  return (
    <div className="space-y-2">
      <Progress value={progress} />
      <p className="text-sm text-muted-foreground text-center">
        Processing scan... {progress}% complete
      </p>
    </div>
  );
};