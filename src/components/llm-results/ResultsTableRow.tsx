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
  const scanResults = scan.results as { model_response: string; prompt: string } | null;
  const inputPrompt = typeof scanResults === 'object' && scanResults ? scanResults.prompt : 'No prompt';
  const modelResponse = typeof scanResults === 'object' && scanResults ? scanResults.model_response : 'No response';

  return (
    <TableRow key={scan.id}>
      <TableCell>{scan.name}</TableCell>
      <TableCell>{formatDate(scan.created_at)}</TableCell>
      <TableCell>
        <TruncatedCell
          content={inputPrompt}
          title="Prompt"
          onContentClick={onContentClick}
        />
      </TableCell>
      <TableCell>
        <TruncatedCell
          content={modelResponse}
          title="Response"
          onContentClick={onContentClick}
        />
      </TableCell>
      <TableCell>{scan.category || 'N/A'}</TableCell>
      <TableCell>{scan.label || 'N/A'}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <DeleteButton scanId={scan.id} />
        </div>
      </TableCell>
    </TableRow>
  );
};