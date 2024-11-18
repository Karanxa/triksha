import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ScanFormActionsProps {
  isScanning: boolean;
  onSubmit: () => void;
}

export const ScanFormActions = ({ isScanning, onSubmit }: ScanFormActionsProps) => {
  return (
    <Button 
      className="w-full" 
      size="lg"
      onClick={onSubmit}
      disabled={isScanning}
    >
      {isScanning ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Scan...
        </>
      ) : (
        "Start LLM Scan"
      )}
    </Button>
  );
};