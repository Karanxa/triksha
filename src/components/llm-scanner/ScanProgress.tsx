import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ScanProgressProps {
  isScanning: boolean;
  progress?: number;  // Made optional since not all scans report progress
}

export const ScanProgress = ({ isScanning, progress = 0 }: ScanProgressProps) => {
  if (!isScanning) return null;

  return (
    <div className="space-y-2">
      <Progress value={progress} />
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Processing scan... {progress}% complete</span>
      </div>
    </div>
  );
};