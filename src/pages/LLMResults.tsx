import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomScanResults } from "@/components/llm-results/CustomScanResults";
import { GeraidResults } from "@/components/llm-results/GeraidResults";
import { Loader2 } from "lucide-react";
import { LLMScan } from "@/components/llm-results/types";

const LLMResults = () => {
  const { data: scans, isLoading, error } = useQuery({
    queryKey: ['llm-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('llm_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LLMScan[];
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Results</h1>
      <p className="text-muted-foreground mb-8">View and analyze the results of your LLM security scans.</p>
      
      <Tabs defaultValue="custom-scan" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="custom-scan">Custom Scan Results</TabsTrigger>
          <TabsTrigger value="geraid">Geraid Engine Results</TabsTrigger>
        </TabsList>

        <TabsContent value="custom-scan">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-8">
              Failed to load scan results: {error.message}
            </div>
          ) : scans && scans.length > 0 ? (
            <CustomScanResults scans={scans} />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No scan results found. Try running a scan first.
            </div>
          )}
        </TabsContent>

        <TabsContent value="geraid">
          <GeraidResults />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LLMResults;