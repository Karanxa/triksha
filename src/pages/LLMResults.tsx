import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const LLMResults = () => {
  const queryClient = useQueryClient();
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

  const deleteScan = useMutation({
    mutationFn: async (scanId: string) => {
      const { error } = await supabase
        .from('llm_scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-scans'] });
      toast.success("Scan deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete scan: " + error.message);
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

  const TruncatedCell = ({ content, title }: { content: string; title: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="max-w-[200px] truncate cursor-pointer hover:text-primary"
            onClick={() => setSelectedContent({ title, content })}
          >
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-[300px] whitespace-normal">Click to view full content</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

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
                scans.map((scan) => {
                  const results = scan.results as { model_response: string, prompt: string } | null;
                  return (
                    <TableRow key={scan.id}>
                      <TableCell>{scan.name}</TableCell>
                      <TableCell>{formatDate(scan.created_at)}</TableCell>
                      <TableCell>
                        <TruncatedCell
                          content={results?.prompt || 'No prompt'}
                          title="Prompt"
                        />
                      </TableCell>
                      <TableCell>
                        <TruncatedCell
                          content={results?.model_response || 'No response'}
                          title="Response"
                        />
                      </TableCell>
                      <TableCell>{scan.category || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteScan.mutate(scan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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