import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle } from "lucide-react";

interface GarakResult {
  probe: string;
  prompt: string;
  response: string;
  passed: boolean;
  details?: string;
}

interface ResultsProps {
  results: GarakResult[];
  isLoading?: boolean;
  progress?: number;
}

export const Results = ({ results, isLoading, progress }: ResultsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Progress value={progress || 0} />
        <p className="text-center text-muted-foreground">
          Running Garak scan... {progress || 0}%
        </p>
      </div>
    );
  }

  if (!results?.length) return null;

  const groupedResults = results.reduce((acc, result) => {
    const [category] = result.probe.split('.');
    if (!acc[category]) acc[category] = [];
    acc[category].push(result);
    return acc;
  }, {} as Record<string, GarakResult[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedResults).map(([category, categoryResults]) => (
        <Card key={category}>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
              {category}
              <Badge variant={getPassRateVariant(categoryResults)}>
                {calculatePassRate(categoryResults)}% Passed
              </Badge>
            </h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {categoryResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{result.probe}</h4>
                      {result.passed ? (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Passed
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
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

const calculatePassRate = (results: GarakResult[]): number => {
  const passed = results.filter(r => r.passed).length;
  return Math.round((passed / results.length) * 100);
};

const getPassRateVariant = (results: GarakResult[]): "default" | "destructive" | "outline" | "secondary" => {
  const rate = calculatePassRate(results);
  if (rate >= 80) return "secondary";
  if (rate >= 50) return "outline";
  return "destructive";
};