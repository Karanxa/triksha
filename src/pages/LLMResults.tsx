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
import { ResultsTableRow } from "@/components/llm-results/ResultsTableRow.tsx";

const LLMResults = () => {
  const [selectedContent, setSelectedContent] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const { data: scans, isLoading } = useQuery({
    queryKey: ['llm-scans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('llm_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to fetch scan results");
        throw error;
      }
      return data;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleExport = () => {
    if (!scans || scans.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8," + 
      "Type,Date,Prompt,Result,Category,Actions\n" +
      scans.map(scan => {
        const results = scan.results as { model_response: string, prompt: string } | null;
        return `"${scan.name}","${formatDate(scan.created_at)}","${results?.prompt || ''}","${results?.model_response || ''}","${scan.category || ''}"`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scan_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleContentClick = (title: string, content: string) => {
    setSelectedContent({ title, content });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">LLM Results</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="w-48">
            <Select defaultValue="all">
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

          <Button variant="secondary" className="ml-auto" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
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
                  <TableCell colSpan={6} className="text-center py-4">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedContent?.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 whitespace-pre-wrap">
              {selectedContent?.content}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LLMResults;