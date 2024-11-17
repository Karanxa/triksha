import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResultsTable } from "@/components/llm-results/ResultsTable";
import { LLMScan } from "@/components/llm-results/types";
import { ResultsFilters } from "@/components/llm-results/ResultsFilters";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

const LLMResults = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [vulnerabilityStatus, setVulnerabilityStatus] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: scans, isLoading } = useQuery({
    queryKey: ['llm-scans', debouncedSearch, selectedCategory, selectedSeverity, vulnerabilityStatus, selectedModel],
    queryFn: async () => {
      let query = supabase
        .from('llm_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.ilike('category', selectedCategory);
      }

      if (selectedSeverity !== 'all') {
        query = query.ilike('severity', selectedSeverity.toLowerCase());
      }

      if (vulnerabilityStatus === 'vulnerable') {
        query = query.eq('is_vulnerable', true);
      } else if (vulnerabilityStatus === 'secure') {
        query = query.eq('is_vulnerable', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching scans:', error);
        throw error;
      }

      let filteredData = data as LLMScan[];

      if (debouncedSearch) {
        filteredData = filteredData.filter((scan: LLMScan) => {
          const results = scan.results || {};
          const promptText = String(results.prompt || '');
          const responseText = String(results.model_response || '');
          const searchLower = debouncedSearch.toLowerCase();
          
          return promptText.toLowerCase().includes(searchLower) || 
                 responseText.toLowerCase().includes(searchLower);
        });
      }

      if (selectedModel !== 'all') {
        filteredData = filteredData.filter((scan: LLMScan) => {
          const model = scan.results?.responses?.[0]?.model || '';
          return model === selectedModel;
        });
      }

      return filteredData;
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
    retry: 1,
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
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
      
      <ResultsTable scans={scans || []} />
    </div>
  );
};

export default LLMResults;