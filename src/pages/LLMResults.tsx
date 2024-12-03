import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResultsTable } from "@/components/llm-results/ResultsTable";
import { ResultsFilters } from "@/components/llm-results/ResultsFilters";
import { Loader2 } from "lucide-react";
import { LLMScan } from "@/components/llm-results/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LLMResults = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedScanType, setSelectedScanType] = useState("all");
  const [vulnerabilityStatus, setVulnerabilityStatus] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");

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

  // Filter scans based on search query and filters
  const filteredScans = scans?.filter(scan => {
    const matchesSearch = searchQuery === "" || 
      (scan.results?.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       scan.results?.model_response?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || scan.category === selectedCategory;
    
    const matchesScanType = selectedScanType === "all" || scan.scan_type === selectedScanType;
    
    const matchesVulnerability = vulnerabilityStatus === "all" || 
      (vulnerabilityStatus === "vulnerable" ? scan.is_vulnerable : !scan.is_vulnerable);

    const matchesModel = selectedModel === "all" || 
      scan.results?.model === selectedModel;

    return matchesSearch && matchesCategory && matchesScanType && 
           matchesVulnerability && matchesModel;
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Results</h1>
      <p className="text-muted-foreground mb-8">View and analyze the results of your LLM security scans.</p>
      
      <ResultsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedScanType={selectedScanType}
        setSelectedScanType={setSelectedScanType}
        vulnerabilityStatus={vulnerabilityStatus}
        setVulnerabilityStatus={setVulnerabilityStatus}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-destructive text-center py-8">
          Failed to load scan results: {error.message}
        </div>
      ) : filteredScans && filteredScans.length > 0 ? (
        <ResultsTable scans={filteredScans} />
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No scan results found. Try running a scan first.
        </div>
      )}
    </div>
  );
};

export default LLMResults;