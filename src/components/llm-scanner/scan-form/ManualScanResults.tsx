import { Card, CardContent } from "@/components/ui/card";
import { ScanResults } from "../ScanResults";

interface ManualScanResultsProps {
  scanResult: any;
}

export const ManualScanResults = ({ scanResult }: ManualScanResultsProps) => {
  if (!scanResult) return null;
  
  return (
    <Card className="border-border/50 mt-8">
      <CardContent className="p-6">
        <ScanResults result={scanResult} />
      </CardContent>
    </Card>
  );
};