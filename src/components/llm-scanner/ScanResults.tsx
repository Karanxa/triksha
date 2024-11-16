import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ScanResult {
  prompt: string;
  model_response: string;
  error?: string;
  is_vulnerable?: boolean;
}

interface ScanResultsProps {
  result: ScanResult | ScanResult[] | null;
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

  // Handle array of results (batch scan)
  if (Array.isArray(result)) {
    return (
      <div className="mt-8 space-y-4">
        {result.map((item, index) => (
          <SingleResult key={index} result={item} />
        ))}
      </div>
    );
  }

  // Handle single result
  return <SingleResult result={result} />;
};

const SingleResult = ({ result }: { result: ScanResult }) => {
  if (!result) return null;

  if (result.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Scan Failed</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTitle>Prompt Used:</AlertTitle>
        <AlertDescription className="mt-2 whitespace-pre-wrap">
          {result.prompt}
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Model Response:</h3>
          <pre className="whitespace-pre-wrap text-foreground p-4 rounded-md border bg-card">
            {result.model_response}
          </pre>
        </CardContent>
      </Card>

      {result.is_vulnerable !== undefined && (
        <Alert variant={result.is_vulnerable ? "destructive" : "default"}>
          {result.is_vulnerable ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {result.is_vulnerable ? "Vulnerability Detected" : "No Vulnerability Detected"}
          </AlertTitle>
        </Alert>
      )}
    </div>
  );
};

export default ScanResults;