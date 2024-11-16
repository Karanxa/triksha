import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { DeleteButton } from "./DeleteButton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { getScanType } from "@/utils/scanUtils";
import { LLMScan } from "./types";
import { analyzeVulnerability } from "./utils/vulnerabilityAnalysis";

interface ResultsTableRowProps {
  scan: LLMScan;
  formatDate: (date: string) => string;
  onContentClick: (title: string, content: string) => void;
}

export const ResultsTableRow = ({ scan, formatDate, onContentClick }: ResultsTableRowProps) => {
  const results = scan.results as any;
  const prompt = results?.prompt || (results?.prompts && results.prompts[0]) || 'No prompt available';
  const response = results?.model_response || 
    (results?.responses && results.responses[0]?.model_response) || 
    'No response available';
  const rawJson = JSON.stringify(results, null, 2);
  const category = scan.category || 'Uncategorized';
  const severity = scan.severity || 'Unknown';
  const scanType = getScanType(results);

  const getCategoryVariant = (category: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (category.toLowerCase()) {
      case 'jailbreaking':
      case 'prompt injection':
      case 'prompt-injection':
      case 'social engineering':
      case 'system prompt extraction':
      case 'system-prompt-extraction':
      case 'unauthorized actions':
      case 'unauthorized-actions':
      case 'sensitive information disclosure':
      case 'sensitive-information-disclosure':
        return 'destructive';
      case 'data extraction':
      case 'data-extraction':
      case 'prompt leaking':
      case 'prompt-leaking':
      case 'model behavior manipulation':
      case 'model-behavior-manipulation':
        return 'secondary';
      case 'resource exhaustion':
      case 'resource-exhaustion':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getSeverityVariant = (severity: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const isVulnerable = scan.is_vulnerable || analyzeVulnerability(response, category);

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
        <TruncatedCell
          content={rawJson}
          title="Raw JSON"
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
        <div className="flex gap-2">
          <DeleteButton scanId={scan.id} />
        </div>
      </TableCell>
    </TableRow>
  );
};