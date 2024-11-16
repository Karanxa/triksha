import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GarakResult {
  prompt: string;
  result?: any;
  error?: string;
}

interface GarakScan {
  id: string;
  name: string;
  status: string;
  model: string;
  test_suites: string[];
  prompts: string[];
  results: GarakResult[] | null;
  created_at: string;
}

export const GarakResults = () => {
  const { data: scans, isLoading } = useQuery({
    queryKey: ['garak-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garak_scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as GarakScan[];
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!scans?.length) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No scan results yet
      </div>
    );
  }

  const calculateProgress = (scan: GarakScan) => {
    if (!scan.results || !Array.isArray(scan.results)) return 0;
    const completedPrompts = scan.results.filter(r => r.result || r.error).length;
    const totalPrompts = scan.prompts.length;
    return (completedPrompts / totalPrompts) * 100;
  };

  return (
    <ScrollArea className="h-[600px] rounded-md border">
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Recent Scans</h2>
        {scans.map((scan) => (
          <div key={scan.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{scan.name}</h3>
              <Badge variant={scan.status === 'completed' ? 'default' : 'secondary'}>
                {scan.status}
              </Badge>
            </div>
            
            {scan.status === 'pending' && scan.results && (
              <div className="space-y-2">
                <Progress value={calculateProgress(scan)} />
                <p className="text-sm text-muted-foreground">
                  {scan.results.filter(r => r.result || r.error).length} / {scan.prompts.length} prompts processed
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Model: {scan.model}
            </p>
            <div className="flex flex-wrap gap-2">
              {scan.test_suites.map((suite: string) => (
                <Badge key={suite} variant="outline">
                  {suite}
                </Badge>
              ))}
            </div>
            {scan.results && (
              <div className="mt-2 space-y-2">
                <h4 className="font-medium text-sm">Results:</h4>
                <div className="max-h-60 overflow-y-auto">
                  {Array.isArray(scan.results) && scan.results.map((result, index) => (
                    <div key={index} className="p-2 bg-muted rounded-md text-xs space-y-1">
                      <p><strong>Prompt:</strong> {result.prompt}</p>
                      {result.error ? (
                        <p className="text-red-500"><strong>Error:</strong> {result.error}</p>
                      ) : (
                        <p><strong>Result:</strong> {JSON.stringify(result.result, null, 2)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};