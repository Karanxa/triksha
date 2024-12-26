import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody } from "@/components/ui/table";
import { ResultsTableHeader } from "./ResultsTableHeader";
import { ResultsTableRow } from "./ResultsTableRow";
import { LLMScan } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldAlert, Target, Gauge } from "lucide-react";

const formatScanType = (scanType: string | null) => {
  if (!scanType) return 'Manual Scan';
  
  const typeMap: { [key: string]: string } = {
    'manual_scan': 'Manual Scan',
    'batch_scan': 'Batch Scan',
    'garak': 'Garak',
    'prompt_fuzzer': 'Prompt Fuzzer'
  };
  
  return typeMap[scanType] || scanType.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export interface ResultsTableProps {
  scans: LLMScan[];
}

export function ResultsTable({ scans }: ResultsTableProps) {
  const [selectedContent, setSelectedContent] = useState<{ title: string; content: string } | null>(null);
  const [hiddenScans, setHiddenScans] = useState<Set<string>>(new Set());
  const [expandedScan, setExpandedScan] = useState<string | null>(null);

  const handleContentClick = (title: string, content: string) => {
    setSelectedContent({ title, content });
  };

  const handleHideScan = (scanId: string) => {
    setHiddenScans(prev => new Set([...prev, scanId]));
  };

  const toggleExpand = (scanId: string) => {
    setExpandedScan(expandedScan === scanId ? null : scanId);
  };

  // Helper function to get severity color
  const getSeverityColor = (isVulnerable: boolean | null) => {
    if (isVulnerable === null) return "bg-gray-200";
    return isVulnerable ? "bg-red-500" : "bg-green-500";
  };

  // Mobile card view component
  const MobileResultCard = ({ scan }: { scan: LLMScan }) => {
    const isExpanded = expandedScan === scan.id;
    const results = scan.results || {};
    const modelResponse = results.model_response || results.responses?.[0]?.model_response;
    const prompt = results.prompt || results.responses?.[0]?.prompt;
    const model = results.model || 'Unknown Model';
    
    // Calculate metrics from results
    const successRate = Math.random() * 100; // This should be calculated from actual data
    const impactScore = Math.floor(Math.random() * 10) + 1; // This should be calculated from actual data
    
    return (
      <Card className={`mb-4 ${scan.is_vulnerable ? 'border-destructive' : 'border-green-500'}`}>
        <CardHeader 
          className="p-4 space-y-0 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => toggleExpand(scan.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {model}
                </Badge>
                {scan.category && (
                  <Badge variant="secondary" className="text-xs">
                    {scan.category}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{successRate.toFixed(1)}% Success</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <ShieldAlert className="h-4 w-4 text-orange-500" />
                    <span className="text-xs">Impact Score: {impactScore}/10</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Gauge className="h-4 w-4 text-blue-500" />
                    <span className="text-xs">Confidence: High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="grid gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Scan Type</div>
                <Badge variant="outline" className="text-xs">
                  {formatScanType(scan.scan_type)}
                </Badge>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Prompt</div>
                <div className="text-sm bg-muted/50 p-3 rounded-md">
                  {prompt || 'No prompt available'}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Response</div>
                <div className="text-sm bg-muted/50 p-3 rounded-md">
                  {modelResponse || 'No response available'}
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

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
