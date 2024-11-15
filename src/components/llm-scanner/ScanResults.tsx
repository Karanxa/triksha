import { Card, CardContent } from "@/components/ui/card";

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
        <div className="whitespace-pre-wrap text-foreground bg-background p-4 rounded-md border">
          {result.model_response}
        </div>
      </CardContent>
    </Card>
  );
};