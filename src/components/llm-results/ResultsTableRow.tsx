import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { DeleteButton } from "./DeleteButton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { getScanType } from "@/utils/scanUtils";
import { LLMScan } from "./types";

// Separate component for Category and Risk badges
const CategoryRiskBadges = ({ category, severity }: { category: string; severity: string }) => {
  const getCategoryVariant = (cat: string): "default" | "destructive" | "secondary" | "outline" => {
    const lowercaseCategory = cat?.toLowerCase() || '';
    if (["jailbreaking", "prompt injection", "social engineering", "system prompt extraction", "unauthorized actions", "sensitive information disclosure"].includes(lowercaseCategory)) {
      return "destructive";
    }
    if (["data extraction", "prompt leaking", "model behavior manipulation"].includes(lowercaseCategory)) {
      return "secondary";
    }
    if (["resource exhaustion"].includes(lowercaseCategory)) {
      return "outline";
    }
    return "default";
  };

  const getSeverityVariant = (sev: string): "default" | "destructive" | "secondary" | "outline" => {
    const lowercaseSeverity = sev?.toLowerCase() || '';
    if (["critical", "high"].includes(lowercaseSeverity)) {
      return "destructive";
    }
    if (lowercaseSeverity === "medium") {
      return "secondary";
    }
    if (lowercaseSeverity === "low") {
      return "outline";
    }
    return "default";
  };

  return (
    <div className="flex flex-col gap-2">
      <Badge variant={getCategoryVariant(category)}>{category || 'Uncategorized'}</Badge>
      <Badge variant={getSeverityVariant(severity)}>{severity || 'Unknown'}</Badge>
    </div>
  );
};

// Separate component for Vulnerability Status
const VulnerabilityStatus = ({ isVulnerable }: { isVulnerable: boolean | null }) => (
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
);

interface ResultsTableRowProps {
  scan: LLMScan;
  formatDate: (date: string) => string;
  onContentClick: (title: string, content: string) => void;
}

export const ResultsTableRow = ({ scan, formatDate, onContentClick }: ResultsTableRowProps) => {
  const results = scan.results || {};
  const prompt = results.prompt || 'No prompt available';
  const response = results.model_response || 'No response available';
  const rawJson = JSON.stringify(results, null, 2);
  const category = scan.category || 'Uncategorized';
  const severity = scan.severity || 'Unknown';
  const scanType = getScanType(results);
  const isVulnerable = scan.is_vulnerable;

  return (
    <TableRow>
      <TableCell>{scanType}</TableCell>
      <TableCell>{formatDate(scan.created_at)}</TableCell>
      <TableCell>
        <TruncatedCell
          content={prompt}
          onContentClick={() => onContentClick("Prompt", prompt)}
        />
      </TableCell>
      <TableCell>
        <TruncatedCell
          content={response}
          onContentClick={() => onContentClick("Response", response)}
        />
      </TableCell>
      <TableCell>
        <TruncatedCell
          content={rawJson}
          onContentClick={() => onContentClick("Raw JSON", rawJson)}
        />
      </TableCell>
      <TableCell>
        <CategoryRiskBadges category={category} severity={severity} />
      </TableCell>
      <TableCell>
        <VulnerabilityStatus isVulnerable={isVulnerable} />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <DeleteButton scanId={scan.id} />
        </div>
      </TableCell>
    </TableRow>
  );
};