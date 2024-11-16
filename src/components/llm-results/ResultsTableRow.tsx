import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { DeleteButton } from "./DeleteButton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { getCategoryVariant, getSeverityVariant } from "@/utils/vulnerabilityUtils";
import { Database } from "@/integrations/supabase/types";

type LLMScan = Database['public']['Tables']['llm_scans']['Row'];

interface ResultsTableRowProps {
  scan: LLMScan;
  formatDate: (date: string) => string;
  onContentClick: (title: string, content: string) => void;
}

export const ResultsTableRow = ({ scan, formatDate, onContentClick }: ResultsTableRowProps) => {
  const results = scan.results as any;

  // Extract prompt and response based on scan type
  let prompt = 'No prompt available';
  let response = 'No response available';
  let scanType = 'Manual Scan';

  if (results) {
    if (results.error) {
      response = `Error: ${results.error}`;
    } else if (results.results && Array.isArray(results.results)) {
      // Batch scan results
      scanType = 'Batch Scan';
      const firstResult = results.results[0];
      if (firstResult) {
        prompt = firstResult.prompt || prompt;
        response = firstResult.model_response || response;
      }
    } else if (results.prompt && results.model_response) {
      // Single scan results
      prompt = results.prompt;
      response = results.model_response;
    }
  }

  const category = scan.category || 'Uncategorized';
  const severity = scan.severity || 'Unknown';
  const isVulnerable = scan.is_vulnerable ?? false;

  return (
    <TableRow key={scan.id}>
      <TableCell>{scanType}</TableCell>
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
          {scan.status === 'failed' ? (
            <div className="flex items-center text-destructive">
              <XCircle className="w-5 h-5 mr-1" />
              Failed
            </div>
          ) : scan.status === 'processing' ? (
            <div className="flex items-center text-muted-foreground">
              <span className="loading loading-spinner loading-sm mr-1"></span>
              Processing
            </div>
          ) : isVulnerable ? (
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