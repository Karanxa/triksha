import { Table, TableBody } from "@/components/ui/table";
import { ResultsTableHeader } from "./ResultsTableHeader";
import { ResultsTableRow } from "./ResultsTableRow";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LLMScan } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ResultsTableProps {
  scans: LLMScan[];
}

export function ResultsTable({ scans }: ResultsTableProps) {
  const [selectedContent, setSelectedContent] = useState<{ title: string; content: string } | null>(null);
  const [hiddenScans, setHiddenScans] = useState<Set<string>>(new Set());
  const [expandedScan, setExpandedScan] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleContentClick = (title: string, content: string) => {
    setSelectedContent({ title, content });
  };

  const handleHideScan = (scanId: string) => {
    setHiddenScans(prev => new Set([...prev, scanId]));
  };

  const toggleExpand = (scanId: string) => {
    setExpandedScan(expandedScan === scanId ? null : scanId);
  };

  // Mobile card view component
  const MobileResultCard = ({ scan }: { scan: LLMScan }) => {
    const isExpanded = expandedScan === scan.id;
    const results = scan.results || {};
    const modelResponse = results.model_response || results.responses?.[0]?.model_response;
    const prompt = results.prompt || results.responses?.[0]?.prompt;
    const model = results.model || 'Unknown Model';
    const date = new Date(scan.created_at);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <Card className="mb-4">
        <CardHeader className="p-4 space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {scan.scan_type || 'Manual Scan'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {model}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formattedDate} • {formattedTime}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toggleExpand(scan.id)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="p-4 pt-0 space-y-4">
            <div>
              <div className="font-medium text-sm mb-1">Prompt:</div>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                {prompt || 'No prompt available'}
              </div>
            </div>
            <div>
              <div className="font-medium text-sm mb-1">Response:</div>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                {modelResponse || 'No response available'}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {scan.category && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Category:</span>
                  <Badge variant="secondary" className="text-xs">{scan.category}</Badge>
                </div>
              )}
              {scan.is_vulnerable !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={scan.is_vulnerable ? "destructive" : "default"} className="text-xs">
                    {scan.is_vulnerable ? "Vulnerable" : "Secure"}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  // Desktop table view
  const DesktopTable = () => (
    <Table>
      <ResultsTableHeader />
      <TableBody>
        {scans
          .filter(scan => !hiddenScans.has(scan.id))
          .map((scan) => (
            <ResultsTableRow
              key={scan.id}
              scan={scan}
              formatDate={formatDate}
              onContentClick={handleContentClick}
              onHide={handleHideScan}
            />
          ))}
      </TableBody>
    </Table>
  );

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {scans
          .filter(scan => !hiddenScans.has(scan.id))
          .map((scan) => (
            <MobileResultCard key={scan.id} scan={scan} />
          ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <DesktopTable />
      </div>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <ScrollArea className="h-full max-h-[70vh]">
            <h3 className="text-lg font-semibold mb-2">{selectedContent?.title}</h3>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md">
              {selectedContent?.content}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}