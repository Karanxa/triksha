import { Table, TableBody } from "@/components/ui/table";
import { ResultsTableHeader } from "./ResultsTableHeader";
import { ResultsTableRow } from "./ResultsTableRow";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LLMScan } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResultsTableProps {
  scans: LLMScan[];
}

export function ResultsTable({ scans }: ResultsTableProps) {
  const [selectedContent, setSelectedContent] = useState<{ title: string; content: string } | null>(null);
  const [hiddenScans, setHiddenScans] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleContentClick = (title: string, content: string) => {
    setSelectedContent({ title, content });
  };

  const handleHideScan = (scanId: string) => {
    setHiddenScans(prev => new Set([...prev, scanId]));
  };

  // Filter out hidden scans and flatten the results
  const visibleResults = scans
    .filter(scan => !hiddenScans.has(scan.id))
    .flatMap(scan => {
      // Get responses from the scan
      let responses = [];
      
      if (scan.results) {
        if (Array.isArray(scan.results.responses)) {
          responses = scan.results.responses;
        } else if (scan.results.prompt || scan.results.model_response) {
          responses = [{
            prompt: scan.results.prompt,
            model_response: scan.results.model_response,
            raw_response: scan.results.raw_response,
            model: scan.results.model
          }];
        }
      }

      // If no responses, create a default one
      if (responses.length === 0) {
        responses = [{
          prompt: 'No prompt available',
          model_response: 'No response available',
          raw_response: {},
          model: 'Unknown Model'
        }];
      }

      // Map each response to include scan metadata and preserve the original scan_type
      return responses.map((response) => ({
        ...scan,
        response: {
          prompt: response?.prompt || 'No prompt available',
          model_response: response?.model_response || response?.response || 'No response available',
          raw_response: response?.raw_response || {},
          model: response?.model || 'Unknown Model'
        }
      }));
    });

  return (
    <>
      <Table>
        <ResultsTableHeader />
        <TableBody>
          {visibleResults.map((result, index) => (
            <ResultsTableRow
              key={`${result.id}-${index}`}
              scan={result}
              response={result.response}
              formatDate={formatDate}
              onContentClick={handleContentClick}
              onHide={handleHideScan}
            />
          ))}
        </TableBody>
      </Table>

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