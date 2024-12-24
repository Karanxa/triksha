import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ScanResults } from "../ScanResults";

interface BatchScanResultsProps {
  scanResult: any;
}

export const BatchScanResults = ({ scanResult }: BatchScanResultsProps) => {
  const navigate = useNavigate();
  
  if (!scanResult) return null;
  
  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="space-y-6">
          <ScanResults result={scanResult} />
          
          <Button 
            onClick={() => navigate('/llm-results')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            View All Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};