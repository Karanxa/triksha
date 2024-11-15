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
        <pre className="whitespace-pre-wrap text-foreground p-4 rounded-md border bg-card">
          {result.model_response}
        </pre>
      </CardContent>
    </Card>
  );
};