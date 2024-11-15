import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { ResultsTableRow } from "@/components/llm-results/ResultsTableRow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from "@/integrations/supabase/types";

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
        query = query.eq('category', filterCategory);
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

  const handleExport = () => {
    if (!scans || scans.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Date,Prompt,Response,Category,Severity,Vulnerability Status\n" +
      scans.map(scan => {
        const results = scan.results as { model_response: string; prompt: string } | null;
        return `"${scan.name}","${formatDate(scan.created_at)}","${results?.prompt || ''}","${results?.model_response || ''}","${scan.category || 'N/A'}","${scan.severity || 'unknown'}","${scan.is_vulnerable === true ? 'Vulnerable' : scan.is_vulnerable === false ? 'Secure' : 'Unknown'}"`;
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

  const handleContentClick = (title: string, content: string) => {
    setSelectedContent({ title, content });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                <SelectItem value="prompt-injection">Prompt Injection</SelectItem>
                <SelectItem value="data-leakage">Data Leakage</SelectItem>
                <SelectItem value="bias">Bias</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
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
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Response</TableHead>
                <TableHead>Category & Risk</TableHead>
                <TableHead>Vulnerability Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading results...
                  </TableCell>
                </TableRow>
              ) : scans && scans.length > 0 ? (
                scans.map((scan) => (
                  <ResultsTableRow
                    key={scan.id}
                    scan={scan}
                    formatDate={formatDate}
                    onContentClick={handleContentClick}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No results found
                  </TableCell>
                </TableRow>
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
    </div>
  );
};

export default LLMResults;