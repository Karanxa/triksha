import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { ResultsContainer } from "@/components/llm-results/ResultsContainer";
import { LLMScan, GeraideScan } from "@/components/llm-results/types";

const LLMResults = () => {
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
    <div className="container py-4 md:py-8">
      <PageHeader
        icon={Shield}
        title="Scan Results"
        description="View and analyze the results of your LLM security scans. Track vulnerabilities and monitor model behavior."
      />
      
      <Card className="w-full mx-auto border border-border/50 shadow-lg">
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
      </Card>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#1c1c1c_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
    </div>
  );
};

export default LLMResults;