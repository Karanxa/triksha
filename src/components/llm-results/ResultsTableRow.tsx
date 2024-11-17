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
  return (
    <Badge 
      variant="default" 
      className="bg-background-dark hover:bg-background-dark text-foreground-dark border border-border"
    >
      {category || 'Uncategorized'}
    </Badge>
  );
};

const VulnerabilityStatus = ({ isVulnerable }: { isVulnerable: boolean | null }) => (
  <div className="flex items-center gap-1 text-sm">
    {isVulnerable ? (
      <div className="flex items-center text-red-500" title="Response shows signs of successful exploitation">
        <CheckCircle2 className="w-4 h-4" />
        <span className="ml-1">Vulnerable</span>
      </div>
    ) : (
      <div className="flex items-center text-green-500" title="No clear signs of successful exploitation">
        <XCircle className="w-4 h-4" />
        <span className="ml-1">Secure</span>
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
  const rawResponse = results.response || results;
  const rawJson = JSON.stringify(rawResponse, null, 2);
  
  const category = scan.category || 'Uncategorized';
  const scanType = getScanType(results);
  const isVulnerable = scan.is_vulnerable;

  const dateOnly = new Date(scan.created_at).toLocaleDateString();
  const fullDateTime = new Date(scan.created_at).toLocaleString();

  return (
    <TableRow className="h-16">
      <TableCell className="py-2">{scanType}</TableCell>
      <TableCell className="py-2">
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
      <TableCell className="py-2">
        <TruncatedCell
          content={prompt}
          onContentClick={() => onContentClick("Prompt", prompt)}
        />
      </TableCell>
      <TableCell className="py-2">
        <TruncatedCell
          content={response}
          onContentClick={() => onContentClick("Response", response)}
        />
      </TableCell>
      <TableCell className="py-2">
        <TruncatedCell
          content={rawJson}
          onContentClick={() => onContentClick("Raw Response", rawJson)}
        />
      </TableCell>
      <TableCell className="py-2">
        <CategoryBadge category={category} />
      </TableCell>
      <TableCell className="py-2">
        <VulnerabilityStatus isVulnerable={isVulnerable} />
      </TableCell>
      <TableCell className="py-2">
        <div className="flex gap-2">
          <DeleteButton scanId={scan.id} />
        </div>
      </TableCell>
    </TableRow>
  );
};