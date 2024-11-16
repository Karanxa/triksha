import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ScanResult {
  suite: string;
  test: string;
  prompt: string;
  response: string;
  passed: boolean;
  details?: string;
}

interface ScanResultsProps {
  results: ScanResult[];
  isLoading?: boolean;
}

export const ScanResults = ({ results, isLoading }: ScanResultsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Results</AlertTitle>
        <AlertDescription>No scan results available yet.</AlertDescription>
      </Alert>
    );
  }

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.suite]) {
      acc[result.suite] = [];
    }
    acc[result.suite].push(result);
    return acc;
  }, {} as Record<string, ScanResult[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedResults).map(([suite, suiteResults]) => (
        <Card key={suite}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{suite}</span>
              <Badge variant={getPassRateVariant(suiteResults)}>
                {calculatePassRate(suiteResults)}% Passed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {suiteResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.test}</h4>
                      {result.passed ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Passed
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Failed
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Prompt:</strong>
                        <pre className="mt-1 p-2 bg-muted rounded-md whitespace-pre-wrap">
                          {result.prompt}
                        </pre>
                      </div>
                      <div>
                        <strong>Response:</strong>
                        <pre className="mt-1 p-2 bg-muted rounded-md whitespace-pre-wrap">
                          {result.response}
                        </pre>
                      </div>
                      {result.details && (
                        <div>
                          <strong>Details:</strong>
                          <pre className="mt-1 p-2 bg-muted rounded-md whitespace-pre-wrap">
                            {result.details}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const calculatePassRate = (results: ScanResult[]): number => {
  const passed = results.filter(r => r.passed).length;
  return Math.round((passed / results.length) * 100);
};

const getPassRateVariant = (results: ScanResult[]): "default" | "success" | "warning" | "destructive" => {
  const rate = calculatePassRate(results);
  if (rate >= 80) return "success";
  if (rate >= 50) return "warning";
  return "destructive";
};