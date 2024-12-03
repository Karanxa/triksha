import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResultsTable } from "@/components/llm-results/ResultsTable";
import { ResultsFilters } from "@/components/llm-results/ResultsFilters";
import { GeraideResults } from "@/components/llm-results/GeraideResults";
import { Loader2 } from "lucide-react";
import { LLMScan, GeraideScan } from "@/components/llm-results/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LLMResults = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedScanType, setSelectedScanType] = useState("all");
  const [vulnerabilityStatus, setVulnerabilityStatus] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");

  // Query for regular LLM scans
  const { data: scans, isLoading: isScansLoading, error: scansError } = useQuery({
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

  // Query for Geraide scans
  const { data: geraidScans, isLoading: isGeraideLoading, error: geraideError } = useQuery({
    queryKey: ['geraide-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contextual_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GeraideScan[];
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

  const renderContent = (type: 'scans' | 'geraide') => {
    const isLoading = type === 'scans' ? isScansLoading : isGeraideLoading;
    const error = type === 'scans' ? scansError : geraideError;
    const data = type === 'scans' ? filteredScans : geraidScans;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-destructive text-center py-8">
          Failed to load results: {error.message}
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No results found. Try running a scan first.
        </div>
      );
    }

    if (type === 'scans') {
      return <ResultsTable scans={data} />;
    }

    return <GeraideResults scans={data} />;
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Results</h1>
      <p className="text-muted-foreground mb-8">View and analyze the results of your LLM security scans.</p>
      
      <Tabs defaultValue="scans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scans">Custom Scans</TabsTrigger>
          <TabsTrigger value="geraide">Geraide Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="scans">
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
          {renderContent('scans')}
        </TabsContent>

        <TabsContent value="geraide">
          {renderContent('geraide')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LLMResults;