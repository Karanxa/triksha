import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ScanFormActionsProps {
  isScanning: boolean;
  onSubmit: () => void;
}

export const ScanFormActions = ({ isScanning, onSubmit }: ScanFormActionsProps) => {
  return (
    <Button 
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-medium" 
      size="lg"
      onClick={onSubmit}
      disabled={isScanning}
    >
      {isScanning ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Processing Scan...
        </div>
      ) : (
        "Start LLM Scan"
      )}
    </Button>
  );
};