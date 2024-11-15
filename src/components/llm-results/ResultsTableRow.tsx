import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { DeleteButton } from "./DeleteButton";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type LLMScan = Database['public']['Tables']['llm_scans']['Row'];

interface ResultsTableRowProps {
  scan: LLMScan;
  formatDate: (date: string) => string;
  onContentClick: (title: string, content: string) => void;
}

export const ResultsTableRow = ({ scan, formatDate, onContentClick }: ResultsTableRowProps) => {
  const results = scan.results as { model_response: string; prompt: string } | null;
  
  const prompt = results?.prompt || 'No prompt';
  const response = results?.model_response || 'No response';
  const category = scan.category || 'Uncategorized';
  const label = scan.label || 'No label';

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'prompt-injection': 'destructive',
      'data-leakage': 'warning',
      'bias': 'secondary',
      default: 'default'
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  return (
    <TableRow key={scan.id}>
      <TableCell>{scan.name}</TableCell>
      <TableCell>{formatDate(scan.created_at)}</TableCell>
      <TableCell>
        <TruncatedCell
          content={prompt}
          title="Prompt"
          onContentClick={onContentClick}
        />
      </TableCell>
      <TableCell>
        <TruncatedCell
          content={response}
          title="Response"
          onContentClick={onContentClick}
        />
      </TableCell>
      <TableCell>
        <Badge variant={getCategoryColor(category)}>{category}</Badge>
      </TableCell>
      <TableCell>{label}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <DeleteButton scanId={scan.id} />
        </div>
      </TableCell>
    </TableRow>
  );
};