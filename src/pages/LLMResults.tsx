import { Button } from "@/components/ui/button";
import { Table, TableBody } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { ResultsTableRow } from "@/components/llm-results/ResultsTableRow";
import { ResultsTableHeader } from "@/components/llm-results/ResultsTableHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from "@/integrations/supabase/types";
import { ATTACK_CATEGORIES } from "@/components/datasets/AttackCategorySelect";
import { getScanType } from "@/utils/scanUtils";

type LLMScan = Database['public']['Tables']['llm_scans']['Row'];

const LLMResults = () => {
  const [selectedContent, setSelectedContent] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: scans, isLoading } = useQuery({
    queryKey: ['llm-scans', filterType, filterCategory],
    queryFn: async () => {
      let query = supabase
        .from('llm_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory.toLowerCase().replace(/ /g, '-'));
      }

      const { data, error } = await query;
      if (error) {
        toast.error("Failed to fetch scan results");
        throw error;
      }
      return data as LLMScan[];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredScans = scans?.filter(scan => {
    if (filterType === 'all') return true;
    const scanType = getScanType(scan.results);
    return filterType === 'batch' 
      ? scanType.toLowerCase().includes('batch')
      : scanType.toLowerCase().includes('manual');
  });

  const handleExport = () => {
    if (!filteredScans?.length) {
      toast.error("No data to export");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," + 
      "Scan Type,Date,Prompt,Response,Category,Severity,Vulnerability Status\n" +
      filteredScans.map(scan => {
        const results = scan.results as any;
        const scanType = getScanType(results);
        const prompt = results?.prompt || (results?.prompts && results.prompts[0]) || '';
        const response = results?.model_response || 
          (results?.responses && results.responses[0]?.model_response) || '';
        
        return `"${scanType}","${formatDate(scan.created_at)}","${prompt}","${response}","${scan.category || 'N/A'}","${scan.severity || 'unknown'}","${scan.is_vulnerable === true ? 'Vulnerable' : scan.is_vulnerable === false ? 'Secure' : 'Unknown'}"`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `scan_results_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Results exported successfully");
  };

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">LLM Security Analysis Results</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-48">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="manual">Manual Prompt</SelectItem>
              <SelectItem value="batch">Batch Scan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ATTACK_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="secondary" className="ml-auto" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Results
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <ResultsTableHeader />
          <TableBody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  Loading results...
                </td>
              </tr>
            ) : filteredScans?.length ? (
              filteredScans.map((scan) => (
                <ResultsTableRow
                  key={scan.id}
                  scan={scan}
                  formatDate={formatDate}
                  onContentClick={(title, content) => setSelectedContent({ title, content })}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  No results found
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4 max-h-[60vh]">
            <div className="whitespace-pre-wrap p-4">
              {selectedContent?.content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LLMResults;