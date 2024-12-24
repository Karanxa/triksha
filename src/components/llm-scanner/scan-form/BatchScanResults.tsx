import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ScanResults } from "../ScanResults";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BatchScanResultsProps {
  scanResult: any;
  scanId?: string;
}

export const BatchScanResults = ({ scanResult, scanId }: BatchScanResultsProps) => {
  const navigate = useNavigate();
  
  if (!scanResult) return null;

  const progress = scanResult.progress || 0;
  const total = scanResult.total || 0;
  const processed = scanResult.processed || 0;
  
  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="space-y-6">
          {progress < 100 && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Processing {processed} of {total} prompts ({Math.round(progress)}%)
              </p>
            </div>
          )}

          <ScrollArea className="h-[400px]">
            <ScanResults result={scanResult} scanId={scanId} />
          </ScrollArea>
          
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