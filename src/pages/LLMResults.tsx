import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { ResultsContainer } from "@/components/llm-results/ResultsContainer";
import { LLMScan, GeraideScan, Message } from "@/components/llm-results/types";

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
      console.log('Fetching LLM scans...');
      const { data, error } = await supabase
        .from('llm_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching LLM scans:', error);
        throw error;
      }
      console.log('LLM scans data:', data);
      return data as LLMScan[];
    },
  });

  // Query for contextual scans with proper type handling
  const { data: geraidScans, isLoading: isGeraideLoading, error: geraideError } = useQuery({
    queryKey: ['contextual-scans'],
    queryFn: async () => {
      console.log('Fetching contextual scans...');
      const { data, error } = await supabase
        .from('contextual_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contextual scans:', error);
        throw error;
      }

      console.log('Raw contextual scans data:', data);

      // Transform the data to match the GeraideScan type
      const transformedData = (data || []).map(scan => {
        // Ensure messages are properly typed
        const messages = Array.isArray(scan.messages) 
          ? scan.messages.map((msg: any) => ({
              role: msg.role as Message['role'],
              content: String(msg.content)
            }))
          : [];

        return {
          id: scan.id,
          user_id: scan.user_id,
          provider: scan.provider,
          model: scan.model,
          messages,
          is_vulnerable: scan.is_vulnerable,
          fingerprint_results: scan.fingerprint_results,
          dataset_analysis_results: scan.dataset_analysis_results,
          created_at: scan.created_at,
          updated_at: scan.updated_at
        } as GeraideScan;
      });

      console.log('Transformed contextual scans:', transformedData);
      return transformedData;
    },
  });

  // Filter regular scans
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

  // Filter contextual scans
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
      <div className="container py-8 space-y-8">
        <PageHeader
          icon={Shield}
          title="Scan Results"
          description="View and analyze the results of your LLM security scans. Track vulnerabilities and monitor model behavior."
        />
        
        <Card className="w-full border border-border/50 shadow-md overflow-hidden">
          <div className="p-6">
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
        </Card>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-dot-pattern opacity-25" />
    </div>
  );
};

export default LLMResults;