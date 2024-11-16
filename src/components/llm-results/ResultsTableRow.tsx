import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { DeleteButton } from "./DeleteButton";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import { CheckCircle2, XCircle } from "lucide-react";
import { getCategoryVariant, getSeverityVariant } from "@/utils/vulnerabilityUtils";

type LLMScan = Database['public']['Tables']['llm_scans']['Row'];

interface ResultsTableRowProps {
  scan: LLMScan;
  formatDate: (date: string) => string;
  onContentClick: (title: string, content: string) => void;
}

export const ResultsTableRow = ({ scan, formatDate, onContentClick }: ResultsTableRowProps) => {
  const results = scan.results as {
    prompt?: string;
    model_response?: string;
    results?: { prompt: string; model_response: string }[];
  } | null;

  // Extract prompt and response based on the results structure
  let prompt = '';
  let response = '';

  if (results) {
    if (results.results && Array.isArray(results.results)) {
      // For batch results, take the first one
      prompt = results.results[0]?.prompt || 'No prompt available';
      response = results.results[0]?.model_response || 'No response available';
    } else {
      // For single results
      prompt = results.prompt || 'No prompt available';
      response = results.model_response || 'No response available';
    }
  }

  const category = scan.category || 'Uncategorized';
  const severity = scan.severity || 'Unknown';
  const isVulnerable = scan.is_vulnerable ?? false;

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
        <div className="flex flex-col gap-2">
          <Badge variant={getCategoryVariant(category)}>{category}</Badge>
          <Badge variant={getSeverityVariant(severity)}>{severity}</Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isVulnerable ? (
            <div className="flex items-center text-red-500" title="Response shows signs of successful exploitation">
              <CheckCircle2 className="w-5 h-5 mr-1" />
              Vulnerable
            </div>
          ) : (
            <div className="flex items-center text-green-500" title="No clear signs of successful exploitation">
              <XCircle className="w-5 h-5 mr-1" />
              Secure
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <DeleteButton scanId={scan.id} />
      </TableCell>
    </TableRow>
  );
};