import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ScanResult {
  model_response: string;
  risk_level: string;
  vulnerabilities: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  recommendations?: string[];
}

interface ScanResultsProps {
  result: ScanResult;
}

export const ScanResults = ({ result }: ScanResultsProps) => {
  if (!result) return null;

  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold mb-2">Model Response</Label>
            <div className="whitespace-pre-wrap rounded-md bg-muted p-4">
              {result.model_response}
            </div>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-2">Security Analysis</Label>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Risk Level</Label>
                <p className="font-medium">{result.risk_level}</p>
              </div>
              
              {result.vulnerabilities?.map((vuln, index) => (
                <div key={index}>
                  <Label className="text-sm text-muted-foreground">
                    Vulnerability {index + 1}
                  </Label>
                  <p className="font-medium">{vuln.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Type: {vuln.type} | Severity: {vuln.severity}
                  </p>
                </div>
              ))}

              {result.recommendations?.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Recommendations
                  </Label>
                  <ul className="list-disc list-inside">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};