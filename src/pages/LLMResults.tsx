import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResultsTable } from "@/components/llm-results/ResultsTable";
import { ResultsFilters } from "@/components/llm-results/ResultsFilters";
import { ContextualScanResults } from "@/components/llm-results/ContextualScanResults";
import { Loader2, Shield, ShieldAlert } from "lucide-react";
import { LLMScan, GeraideScan, Message } from "@/components/llm-results/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

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

  // Query for Geraide scans with proper type conversion
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
          role: msg.role as Message['role'],
          content: msg.content as string
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

    const matchesModel = selectedModel === "all" || 
      scan.results?.model === selectedModel;

    return matchesSearch && matchesCategory && matchesScanType && 
           matchesVulnerability && matchesModel;
  });

  const renderContent = (type: 'scans' | 'contextual') => {
    const isLoading = type === 'scans' ? isScansLoading : isGeraideLoading;
    const error = type === 'scans' ? scansError : geraideError;
    const data = type === 'scans' ? filteredScans : geraidScans;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading results...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-destructive">Failed to load results: {(error as Error).message}</p>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No results found. Try running a scan first.</p>
          </div>
        </div>
      );
    }

    if (type === 'scans') {
      return <ResultsTable scans={data as LLMScan[]} />;
    }

    return <ContextualScanResults scans={data as GeraideScan[]} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Results</h1>
          <p className="text-muted-foreground">
            View and analyze the results of your LLM security scans.
          </p>
        </div>
        
        <Card className="bg-results-header border-0 shadow-sm">
          <Tabs defaultValue="scans" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="scans" className="data-[state=active]:bg-background">
                Custom Scans
              </TabsTrigger>
              <TabsTrigger value="contextual" className="data-[state=active]:bg-background">
                Contextual Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="scans" className="mt-0 animate-fade-in">
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

            <TabsContent value="contextual" className="mt-0 animate-fade-in">
              {renderContent('contextual')}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default LLMResults;