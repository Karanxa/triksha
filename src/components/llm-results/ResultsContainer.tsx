import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResultsTable } from "./ResultsTable";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { ResultsFilters } from "./ResultsFilters";

export const ResultsContainer = () => {
  const { data: results, isLoading, error } = useQuery({
    queryKey: ["llm-scan-results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("llm_scan_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!results?.length) return <EmptyState />;

  return (
    <div className="space-y-6">
      <ResultsFilters />
      <ResultsTable results={results} />
    </div>
  );
};