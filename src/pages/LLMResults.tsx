import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResultsTable } from "@/components/llm-results/ResultsTable";
import { LLMScan } from "@/components/llm-results/types";

const LLMResults = () => {
  const { data: scans, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">LLM Scan Results</h1>
      <ResultsTable scans={scans || []} />
    </div>
  );
};

export default LLMResults;