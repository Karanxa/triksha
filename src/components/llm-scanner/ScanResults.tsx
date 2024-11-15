import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ScanResult {
  model_response: string;
}

interface ScanResultsProps {
  result: ScanResult;
}

export const ScanResults = ({ result }: ScanResultsProps) => {
  if (!result) return null;

  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <div>
          <Label className="text-lg font-semibold mb-2">Model Response</Label>
          <div className="whitespace-pre-wrap rounded-md bg-muted p-4">
            {result.model_response}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};