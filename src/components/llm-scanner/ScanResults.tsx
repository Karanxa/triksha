import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ScanResult {
  prompt?: string;
  model_response?: string;
  results?: Array<{
    prompt: string;
    model_response: string;
  }>;
  error?: string;
  is_vulnerable?: boolean;
  category?: string;
  severity?: string;
}

interface ScanResultsProps {
  result: ScanResult | null;
  isLoading?: boolean;
}

export const ScanResults = ({ result, isLoading }: ScanResultsProps) => {
  const navigate = useNavigate();

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

  // Handle error case
  if (result.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Scan Failed</AlertTitle>
        <AlertDescription>{result.error}</AlertDescription>
      </Alert>
    );
  }

  // Handle batch scan results (redirect to results page)
  if (result.results && Array.isArray(result.results)) {
    return (
      <div className="mt-6 space-y-4">
        <Alert>
          <AlertTitle>Batch Scan Completed</AlertTitle>
          <AlertDescription>
            Successfully processed {result.results.length} prompts.
          </AlertDescription>
        </Alert>
        <Button
          variant="default"
          className="w-full"
          onClick={() => navigate("/llm-results")}
        >
          View Batch Results <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Handle single result
  return (
    <div className="mt-6 space-y-4">
      <Alert>
        <AlertTitle>Scan Results</AlertTitle>
        <AlertDescription className="mt-2">
          {result.model_response || "No response available. Please try again with a more specific prompt."}
        </AlertDescription>
      </Alert>
      
      {result.prompt && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium">Original Prompt:</h3>
              <div className="flex gap-2">
                {result.category && (
                  <Badge variant="secondary">{result.category}</Badge>
                )}
                {result.severity && (
                  <Badge variant="outline">{result.severity}</Badge>
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
            </div>
            <pre className="whitespace-pre-wrap text-foreground p-4 rounded-md border bg-card">
              {result.prompt}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanResults;