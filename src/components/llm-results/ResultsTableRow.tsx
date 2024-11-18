import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileJson } from "lucide-react";
import { LLMScan } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { HideButton } from "./HideButton";

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

const formatScanType = (scanType: string | null) => {
  if (!scanType) return 'Manual Scan';
  return scanType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getFullModelName = (model: string): string => {
  switch (model) {
    case 'gpt-4o':
      return 'GPT-4 Opus';
    case 'gpt-4o-mini':
      return 'GPT-4 Opus Mini';
    case 'claude-3-opus-20240229':
      return 'Claude 3 Opus';
    case 'claude-3-sonnet-20240229':
      return 'Claude 3 Sonnet';
    case 'gemini-1.0-pro':
      return 'Gemini Pro';
    case 'gemini-1.0-ultra':
      return 'Gemini Ultra';
    case 'llama2':
      return 'Llama 2';
    case 'mistral':
      return 'Mistral';
    case 'codellama':
      return 'Code Llama';
    default:
      return model || 'Unknown Model';
  }
};

interface ResultsTableRowProps {
  scan: LLMScan;
  response: {
    prompt: string;
    model_response: string;
    raw_response: any;
  };
  formatDate: (date: string) => string;
  onContentClick: (title: string, content: string) => void;
  onHide: (scanId: string) => void;
}

export const ResultsTableRow = ({ scan, response, formatDate, onContentClick, onHide }: ResultsTableRowProps) => {
  const modelName = scan.results?.model || 'Unknown Model';
  const fullModelName = getFullModelName(modelName);
  const dateOnly = new Date(scan.created_at).toLocaleDateString();
  const fullDateTime = new Date(scan.created_at).toLocaleString();

  return (
    <TableRow className="h-16">
      <TableCell className="py-2">
        {formatScanType(scan.scan_type)}
      </TableCell>
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="cursor-default">
                {fullModelName}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{modelName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="py-2 border-l">
        <TruncatedCell
          content={response.prompt}
          onContentClick={() => onContentClick("Prompt", response.prompt)}
        />
      </TableCell>
      <TableCell className="py-2">
        <TruncatedCell
          content={response.model_response}
          onContentClick={() => onContentClick("Response", response.model_response)}
        />
      </TableCell>
      <TableCell className="py-2 w-[60px] text-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onContentClick("Raw Data", JSON.stringify(response.raw_response, null, 2))}
        >
          <FileJson className="h-4 w-4" />
        </Button>
      </TableCell>
      <TableCell className="py-2 border-l">
        <CategoryBadge category={scan.category || 'Uncategorized'} />
      </TableCell>
      <TableCell className="py-2">
        <VulnerabilityStatus isVulnerable={scan.is_vulnerable} />
      </TableCell>
      <TableCell className="py-2">
        <div className="flex gap-2">
          <HideButton scanId={scan.id} onHide={onHide} />
        </div>
      </TableCell>
    </TableRow>
  );
};