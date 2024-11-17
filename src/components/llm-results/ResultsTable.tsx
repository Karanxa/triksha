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

  return (
    <>
      <Table>
        <ResultsTableHeader />
        <TableBody>
          {scans.map((scan) => (
            <ResultsTableRow
              key={scan.id}
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