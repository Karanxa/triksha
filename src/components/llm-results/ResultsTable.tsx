import { Table, TableBody } from "@/components/ui/table";
import { ResultsTableHeader } from "./ResultsTableHeader";
import { ResultsTableRow } from "./ResultsTableRow";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LLMScan } from "./types";

interface ResultsTableProps {
  scans: LLMScan[];
}

export function ResultsTable({ scans }: ResultsTableProps) {
  const [selectedContent, setSelectedContent] = useState<{ title: string; content: string } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleContentClick = (title: string, content: string) => {
    setSelectedContent({ title, content });
  };

  // Flatten scans to show individual prompt-response pairs
  const flattenedScans = scans.flatMap(scan => {
    const results = scan.results || {};
    
    if (Array.isArray(results.responses)) {
      // For batch scans with multiple responses
      return results.responses.map((response, index) => ({
        ...scan,
        results: {
          prompt: response.prompt,
          model_response: response.model_response || response.response,
          timestamp: response.timestamp
        },
        name: `${scan.name} (${index + 1}/${results.responses.length})`
      }));
    }
    
    // For single scans
    return [{
      ...scan,
      results: {
        prompt: results.prompt,
        model_response: results.model_response || results.response,
        timestamp: results.timestamp
      }
    }];
  });

  return (
    <>
      <Table>
        <ResultsTableHeader />
        <TableBody>
          {flattenedScans.map((scan, index) => (
            <ResultsTableRow
              key={`${scan.id}-${index}`}
              scan={scan}
              formatDate={formatDate}
              onContentClick={handleContentClick}
            />
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">{selectedContent?.title}</h3>
          <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md">
            {selectedContent?.content}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}