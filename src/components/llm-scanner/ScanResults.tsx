import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScanResult {
  prompt?: string;
  model_response?: string;
  error?: string;
  is_vulnerable?: boolean;
}

interface ScanResultsProps {
  result: ScanResult | ScanResult[] | null;
  isLoading?: boolean;
  scanId?: string;
}

export const ScanResults = ({ result, isLoading, scanId }: ScanResultsProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scanId) return;

    const subscription = supabase
      .channel(`scan_${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'llm_scans',
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          if (payload.new.status === 'processing') {
            setStatus('processing');
            setProgress(payload.new.results?.progress || 0);
          } else if (payload.new.status === 'completed') {
            setStatus('completed');
            setProgress(100);
          } else if (payload.new.status === 'failed') {
            setStatus('failed');
            setError(payload.new.results?.error || 'Unknown error occurred');
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [scanId]);

  if (isLoading || status === 'processing') {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              Processing scan... {progress}% complete
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Scan Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return (
      <Alert variant="default" className="mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Results</AlertTitle>
        <AlertDescription>No scan results available.</AlertDescription>
      </Alert>
    );
  }

  // Handle array of results (batch scan)
  if (Array.isArray(result)) {
    return (
      <ScrollArea className="h-[60vh] mt-8">
        <div className="space-y-4">
          {result.map((item, index) => (
            <SingleResult key={index} result={item} />
          ))}
        </div>
      </ScrollArea>
    );
  }

  // Handle single result
  return <SingleResult result={result} />;
};

const SingleResult = ({ result }: { result: ScanResult }) => {
  if (!result) {
    return null;
  }

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
          {result.prompt && (
            <AlertDescription className="mt-2">
              <strong>Prompt:</strong> {result.prompt}
            </AlertDescription>
          )}
        </Alert>
      )}
      
      {result.model_response && (
        <Card>
          <CardContent className="pt-6">
            <pre className="whitespace-pre-wrap text-foreground p-4 rounded-md border bg-card">
              {result.model_response}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};