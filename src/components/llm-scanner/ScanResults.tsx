import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ScanResult {
  model_response: string;
  error?: string;
  isVulnerable?: boolean;
}

interface ScanResultsProps {
  result: ScanResult;
  isLoading?: boolean;
}

export const ScanResults = ({ result, isLoading }: ScanResultsProps) => {
  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  if (result.error) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Scan Failed</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {result.isVulnerable !== undefined && (
        <Alert variant={result.isVulnerable ? "destructive" : "default"}>
          {result.isVulnerable ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {result.isVulnerable ? "Vulnerability Detected" : "No Vulnerability Detected"}
          </AlertTitle>
        </Alert>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <pre className="whitespace-pre-wrap text-foreground p-4 rounded-md border bg-card">
            {result.model_response}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};