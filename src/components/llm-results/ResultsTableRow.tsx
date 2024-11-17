import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { DeleteButton } from "./DeleteButton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { getScanType } from "@/utils/scanUtils";
import { LLMScan } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CategoryBadge = ({ category }: { category: string }) => {
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

  return (
    <Badge variant={getCategoryVariant(category)}>{category || 'Uncategorized'}</Badge>
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
  
  // Get the raw response directly from the results object
  const rawResponse = results.raw_response || results;
  const rawJson = JSON.stringify(rawResponse, null, 2);
  
  const category = scan.category || 'Uncategorized';
  const scanType = getScanType(results);
  const isVulnerable = scan.is_vulnerable;

  const dateOnly = new Date(scan.created_at).toLocaleDateString();
  const fullDateTime = new Date(scan.created_at).toLocaleString();

  return (
    <TableRow>
      <TableCell>{scanType}</TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-default">
              {dateOnly}
            </TooltipTrigger>
            <TooltipContent>
              <p>{fullDateTime}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
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
          onContentClick={() => onContentClick("Raw Response", rawJson)}
        />
      </TableCell>
      <TableCell>
        <CategoryBadge category={category} />
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