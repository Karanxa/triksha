import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ScanFormSubmitProps {
  onSubmit: () => void;
  isScanning: boolean;
}

export const ScanFormSubmit = ({ onSubmit, isScanning }: ScanFormSubmitProps) => {
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