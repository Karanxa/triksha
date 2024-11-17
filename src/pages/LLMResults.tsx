import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResultsTable } from "@/components/llm-results/ResultsTable";
import { LLMScan } from "@/components/llm-results/types";
import { ResultsFilters } from "@/components/llm-results/ResultsFilters";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

const LLMResults = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [vulnerabilityStatus, setVulnerabilityStatus] = useState("");
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: scans, isLoading } = useQuery({
    queryKey: ['llm-scans', debouncedSearch, selectedCategory, selectedSeverity, vulnerabilityStatus],
    queryFn: async () => {
      let query = supabase
        .from('llm_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (selectedSeverity) {
        query = query.eq('severity', selectedSeverity);
      }

      if (vulnerabilityStatus === 'vulnerable') {
        query = query.eq('is_vulnerable', true);
      } else if (vulnerabilityStatus === 'secure') {
        query = query.eq('is_vulnerable', false);
      }

      if (debouncedSearch) {
        query = query.or(`prompt.ilike.%${debouncedSearch}%,model_response.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query;

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
      
      <ResultsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedSeverity={selectedSeverity}
        setSelectedSeverity={setSelectedSeverity}
        vulnerabilityStatus={vulnerabilityStatus}
        setVulnerabilityStatus={setVulnerabilityStatus}
      />
      
      <ResultsTable scans={scans || []} />
    </div>
  );
};

export default LLMResults;