import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { LLMScan, GeraideScan } from "@/components/llm-results/types";
import { ResultsContainer } from "@/components/llm-results/ResultsContainer";
import { Shield } from "lucide-react";

const LLMResults = () => {
  // Custom scans filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedScanType, setSelectedScanType] = useState("all");
  const [vulnerabilityStatus, setVulnerabilityStatus] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");

  // Contextual analysis filters
  const [contextSearchQuery, setContextSearchQuery] = useState("");
  const [contextModel, setContextModel] = useState("all");
  const [contextVulnerabilityStatus, setContextVulnerabilityStatus] = useState("all");

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

      return (data || []).map(scan => ({
        ...scan,
        messages: (scan.messages as any[]).map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      })) as GeraideScan[];
    },
  });

  const filteredScans = scans?.filter(scan => {
    const matchesSearch = searchQuery === "" || 
      (scan.results?.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       scan.results?.model_response?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || scan.category === selectedCategory;
    const matchesScanType = selectedScanType === "all" || scan.scan_type === selectedScanType;
    const matchesVulnerability = vulnerabilityStatus === "all" || 
      (vulnerabilityStatus === "vulnerable" ? scan.is_vulnerable : !scan.is_vulnerable);
    const matchesModel = selectedModel === "all" || scan.results?.model === selectedModel;

    return matchesSearch && matchesCategory && matchesScanType && 
           matchesVulnerability && matchesModel;
  });

  const filteredContextualScans = geraidScans?.filter(scan => {
    const matchesSearch = contextSearchQuery === "" || 
      scan.messages.some(msg => 
        msg.content.toLowerCase().includes(contextSearchQuery.toLowerCase())
      );
    const matchesModel = contextModel === "all" || scan.model === contextModel;
    const matchesVulnerability = contextVulnerabilityStatus === "all" || 
      (contextVulnerabilityStatus === "vulnerable" ? scan.is_vulnerable : !scan.is_vulnerable);

    return matchesSearch && matchesModel && matchesVulnerability;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8 animate-fade-in">
        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 rounded-lg" />
          <div className="relative p-6 md:p-8 rounded-lg glass-card">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Scan Results
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              View and analyze the results of your LLM security scans. Track vulnerabilities and monitor model behavior.
            </p>
          </div>
        </div>
        
        <ResultsContainer
          scans={scans}
          geraidScans={geraidScans}
          isScansLoading={isScansLoading}
          isGeraideLoading={isGeraideLoading}
          scansError={scansError as Error | null}
          geraideError={geraideError as Error | null}
          filteredScans={filteredScans}
          filteredContextualScans={filteredContextualScans}
          searchProps={{
            searchQuery,
            setSearchQuery,
            selectedCategory,
            setSelectedCategory,
            selectedScanType,
            setSelectedScanType,
            vulnerabilityStatus,
            setVulnerabilityStatus,
            selectedModel,
            setSelectedModel,
          }}
          contextualProps={{
            contextSearchQuery,
            setContextSearchQuery,
            contextModel,
            setContextModel,
            contextVulnerabilityStatus,
            setContextVulnerabilityStatus,
          }}
        />
      </div>
      
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  );
};

export default LLMResults;