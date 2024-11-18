import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileJson } from "lucide-react";
import { LLMScan, ScanResponse } from "./types";
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
  formatDate: (date: string) => string;
  onContentClick: (title: string, content: string) => void;
  onHide: (scanId: string) => void;
}

export const ResultsTableRow = ({ scan, formatDate, onContentClick, onHide }: ResultsTableRowProps) => {
  // Handle both single prompt and batch responses
  const isSinglePrompt = scan.scan_type === 'manual_scan';
  
  let prompt = 'No prompt available';
  let response = 'No response available';
  let rawResponse = {};
  
  if (isSinglePrompt) {
    // For single prompt scans
    prompt = scan.results?.prompt || scan.results?.responses?.[0]?.prompt || 'No prompt available';
    response = scan.results?.model_response || scan.results?.responses?.[0]?.model_response || 'No response available';
    rawResponse = scan.results?.raw_response || scan.results || {};
  } else {
    // For batch scans, get responses from the responses array
    const responses = scan.results?.responses || [];
    if (responses && responses.length > 0) {
      // Find the first valid response
      const validResponse = responses.find(r => r && (r.prompt || r.model_response));
      if (validResponse) {
        prompt = validResponse.prompt || 'No prompt available';
        response = validResponse.model_response || validResponse.response || 'No response available';
        rawResponse = validResponse.raw_response || validResponse;
      }
    }
  }
  
  const category = scan.category || 'Uncategorized';
  const isVulnerable = scan.is_vulnerable ?? null;
  
  const modelName = scan.results?.model || 'Unknown Model';
  const fullModelName = getFullModelName(modelName);

  const dateOnly = new Date(scan.created_at).toLocaleDateString();
  const fullDateTime = new Date(scan.created_at).toLocaleString();

  return (
    <TableRow className="h-16">
      <TableCell className="py-2">{formatScanType(scan.scan_type)}</TableCell>
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
      <TableCell className="py-2 w-[60px] text-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onContentClick("Raw Data", JSON.stringify(rawResponse, null, 2))}
        >
          <FileJson className="h-4 w-4" />
        </Button>
      </TableCell>
      <TableCell className="py-2 border-l">
        <CategoryBadge category={category} />
      </TableCell>
      <TableCell className="py-2">
        <VulnerabilityStatus isVulnerable={isVulnerable} />
      </TableCell>
      <TableCell className="py-2">
        <div className="flex gap-2">
          <HideButton scanId={scan.id} onHide={onHide} />
        </div>
      </TableCell>
    </TableRow>
  );
};