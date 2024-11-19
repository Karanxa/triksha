import { Table, TableBody } from "@/components/ui/table";
import { ResultsTableHeader } from "./ResultsTableHeader";
import { ResultsTableRow } from "./ResultsTableRow";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LLMScan } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const MobileResultCard = ({ scan }: { scan: any }) => {
    const isExpanded = expandedScan === scan.id;
    const response = scan.response || {};

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">
                {scan.scan_type || 'Manual Scan'}
              </Badge>
              <div className="text-sm text-muted-foreground">
                {formatDate(scan.created_at)}
              </div>
            </div>
            <Badge>{response.model || scan.results?.model || 'Unknown Model'}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-between"
            onClick={() => toggleExpand(scan.id)}
          >
            View Details
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
          
          {isExpanded && (
            <div className="mt-4 space-y-4">
              <div>
                <div className="font-medium mb-1">Prompt:</div>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                  {response.prompt || 'No prompt available'}
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">Response:</div>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                  {response.model_response || 'No response available'}
                </div>
              </div>
              {scan.category && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Category:</span>
                  <Badge variant="secondary">{scan.category}</Badge>
                </div>
              )}
              {scan.is_vulnerable !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge variant={scan.is_vulnerable ? "destructive" : "success"}>
                    {scan.is_vulnerable ? "Vulnerable" : "Secure"}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
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
          .map((scan, index) => (
            <ResultsTableRow
              key={`${scan.id}-${index}`}
              scan={scan}
              response={scan.response}
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