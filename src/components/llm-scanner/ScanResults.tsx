import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScanResult {
  prompt?: string;
  model_response?: string;
  category?: string;
  is_vulnerable?: boolean;
  error?: string;
}

interface ScanResultsProps {
  result: ScanResult | null;
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
      <Alert variant="destructive" className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Scan Failed</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <Alert>
        <AlertTitle className="flex items-center justify-between">
          Scan Results
          <div className="flex items-center gap-2">
            {result.category && (
              <Badge variant="secondary">{result.category}</Badge>
            )}
            <Badge 
              variant={result.is_vulnerable ? "destructive" : "default"}
              className="flex items-center gap-1"
            >
              {result.is_vulnerable ? (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Vulnerable
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Secure
                </>
              )}
            </Badge>
          </div>
        </AlertTitle>
      </Alert>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Prompt:</h3>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                {result.prompt}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">Response:</h3>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                {result.model_response}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanResults;