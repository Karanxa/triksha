import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResultsTable } from "@/components/llm-results/ResultsTable";
import { ResultsFilters } from "@/components/llm-results/ResultsFilters";
import { Loader2 } from "lucide-react";
import { LLMScan } from "@/components/llm-results/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GarakResults } from "@/components/garak-scan/Results";

const LLMResults = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedScanType, setSelectedScanType] = useState("all");
  const [vulnerabilityStatus, setVulnerabilityStatus] = useState("all");
  const [selectedModel, setSelectedModel] = useState("all");

  // Query for regular LLM scans
  const { data: scans, isLoading: scansLoading, error: scansError } = useQuery({
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

  // Query for Garak scans
  const { data: garakScans, isLoading: garakLoading, error: garakError } = useQuery({
    queryKey: ['garak-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garak_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Query for contextual scans (previously geraid)
  const { data: contextualScans, isLoading: contextualLoading, error: contextualError } = useQuery({
    queryKey: ['contextual-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contextual_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const isLoading = scansLoading || garakLoading || contextualLoading;
  const error = scansError || garakError || contextualError;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Results</h1>
      <p className="text-muted-foreground mb-8">View and analyze the results of your LLM security scans.</p>
      
      <Tabs defaultValue="llm-scans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="llm-scans">LLM Scans</TabsTrigger>
          <TabsTrigger value="garak">Garak Scans</TabsTrigger>
          <TabsTrigger value="contextual">Contextual Scans</TabsTrigger>
        </TabsList>

        <TabsContent value="llm-scans">
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
          
          {scansLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : scansError ? (
            <div className="text-destructive text-center py-8">
              Failed to load scan results: {scansError.message}
            </div>
          ) : scans && scans.length > 0 ? (
            <ResultsTable scans={scans} />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No scan results found. Try running a scan first.
            </div>
          )}
        </TabsContent>

        <TabsContent value="garak">
          {garakLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : garakError ? (
            <div className="text-destructive text-center py-8">
              Failed to load Garak results: {garakError.message}
            </div>
          ) : garakScans && garakScans.length > 0 ? (
            <div className="space-y-4">
              {garakScans.map((scan) => (
                <div key={scan.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{scan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Model: {scan.model} | Status: {scan.status}
                  </p>
                  {scan.results && <GarakResults results={scan.results.responses || []} />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No Garak scan results found. Try running a Garak scan first.
            </div>
          )}
        </TabsContent>

        <TabsContent value="contextual">
          {contextualLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : contextualError ? (
            <div className="text-destructive text-center py-8">
              Failed to load contextual scan results: {contextualError.message}
            </div>
          ) : contextualScans && contextualScans.length > 0 ? (
            <div className="space-y-4">
              {contextualScans.map((scan) => (
                <div key={scan.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">
                    Contextual Scan - {scan.model}
                  </h3>
                  <div className="space-y-2">
                    {scan.messages.map((message: any, index: number) => (
                      <div key={index} className="p-2 bg-muted rounded">
                        <p className="font-medium">{message.role}</p>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No contextual scan results found. Try running a contextual scan first.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LLMResults;