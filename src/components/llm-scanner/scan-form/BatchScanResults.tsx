import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BatchScanResultsProps {
  scanResult: any;
}

export const BatchScanResults = ({ scanResult }: BatchScanResultsProps) => {
  const navigate = useNavigate();
  
  if (!scanResult) return null;
  
  return (
    <div className="mt-8 flex justify-center">
      <Button 
        onClick={() => navigate('/llm-results')}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        View Results
      </Button>
    </div>
  );
};