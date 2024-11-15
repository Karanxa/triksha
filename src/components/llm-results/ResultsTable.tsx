import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { DeleteButton } from "./DeleteButton";
import { Database } from "@/integrations/supabase/types";

type LLMScan = Database['public']['Tables']['llm_scans']['Row'];

interface ResultsTableRowProps {
  scan: LLMScan;
  formatDate: (date: string) => string;
  onContentClick: (title: string, content: string) => void;
}

export const ResultsTableRow = ({ scan, formatDate, onContentClick }: ResultsTableRowProps) => {
  const results = scan.results as { model_response: string; prompt: string } | null;

  return (
    <TableRow key={scan.id}>
      <TableCell>{scan.name}</TableCell>
      <TableCell>{formatDate(scan.created_at)}</TableCell>
      <TableCell>
        <TruncatedCell
          content={results?.prompt || 'No prompt'}
          title="Prompt"
          onContentClick={onContentClick}
        />
      </TableCell>
      <TableCell>
        <TruncatedCell
          content={results?.model_response || 'No response'}
          title="Response"
          onContentClick={onContentClick}
        />
      </TableCell>
      <TableCell>{scan.category || 'N/A'}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <DeleteButton scanId={scan.id} />
        </div>
      </TableCell>
    </TableRow>
  );
};