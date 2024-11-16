import { Button } from "@/components/ui/button";
import { Table, TableBody } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Filter } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";

type LLMScan = Database['public']['Tables']['llm_scans']['Row'];

const LLMResults = () => {
  const [selectedContent, setSelectedContent] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { data: scans, isLoading } = useQuery({
    queryKey: ['llm-scans', filterType, filterCategory, searchQuery, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('llm_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory.toLowerCase().replace(/ /g, '-'));
      }

      if (dateRange.from && dateRange.to) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Failed to fetch scan results");
        throw error;
      }

      let filteredData = data as LLMScan[];

      // Client-side filtering for search and scan type
      if (searchQuery) {
        const lowercaseQuery = searchQuery.toLowerCase();
        filteredData = filteredData.filter(scan => 
          scan.name.toLowerCase().includes(lowercaseQuery) ||
          scan.category?.toLowerCase().includes(lowercaseQuery)
        );
      }

      if (filterType !== 'all') {
        filteredData = filteredData.filter(scan => {
          const scanType = getScanType(scan.results);
          return scanType.toLowerCase() === filterType.toLowerCase();
        });
      }

      return filteredData;
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
      "Scan Type,Date,Prompt,Response,Category,Severity,Vulnerability Status\n" +
      scans.map(scan => {
        const results = scan.results as { model_response: string; prompt: string } | null;
        const scanType = getScanType(results);
        return `"${scanType}","${formatDate(scan.created_at)}","${results?.prompt || ''}","${results?.model_response || ''}","${scan.category || 'N/A'}","${scan.severity || 'unknown'}","${scan.is_vulnerable === true ? 'Vulnerable' : scan.is_vulnerable === false ? 'Secure' : 'Unknown'}"`;
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
        <h1 className="text-3xl font-bold mb-2">LLM Security Analysis Results</h1>
        <p className="text-muted-foreground mb-8">Review and analyze the results of your LLM security scans</p>

        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
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

            <div className="flex-1">
              <Input
                placeholder="Search scans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
            />

            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>

          {scans && (
            <p className="text-sm text-muted-foreground">
              Showing {scans.length} results
            </p>
          )}
        </div>

        <div className="border rounded-lg">
          <Table>
            <ResultsTableHeader />
            <TableBody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Loading results...
                    </div>
                  </td>
                </tr>
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
                <tr>
                  <td colSpan={7} className="text-center py-4">
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
    </div>
  );
};

export default LLMResults;