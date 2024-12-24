import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ScanProgressProps {
  isScanning: boolean;
  progress: number;
}

export const ScanProgress = ({ isScanning, progress }: ScanProgressProps) => {
  if (!isScanning && progress === 0) return null;

  return (
    <Card className="border border-border/50">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-sm font-medium text-black">
              {progress === 100 ? 'Scan completed!' : 'Processing scan...'}
            </p>
          </div>
          
          <Progress 
            value={progress} 
            className="h-2 transition-all"
          />
          
          <p className="text-sm text-center text-black">
            {progress}% complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
};