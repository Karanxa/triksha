import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileJson, Terminal } from "lucide-react";
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
  <div className="flex items-center">
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
  
  const typeMap: { [key: string]: string } = {
    'manual_scan': 'Manual Scan',
    'batch_scan': 'Batch Scan',
    'garak': 'Garak',
    'prompt_fuzzer': 'Prompt Fuzzer'
  };
  
  return typeMap[scanType] || scanType.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface ResultsTableRowProps {
  scan: LLMScan;
  onContentClick: (title: string, content: string) => void;
  onHide: (scanId: string) => void;
}

export const ResultsTableRow = ({ scan, onContentClick, onHide }: ResultsTableRowProps) => {
  const results = scan.results as {
    responses?: ScanResponse[];
    model_response?: string;
    prompt?: string;
    raw_response?: any;
    model?: string;
  } || {};
  
  // Extract data based on scan type
  let modelResponse: string | undefined,
      prompt: string | undefined,
      rawResponse: any,
      model: string;
  
  if (scan.scan_type === 'batch_scan') {
    // For batch scans, get the first response from the responses array
    const responses = results.responses || [];
    const firstResponse = responses[0] || {};
    modelResponse = firstResponse.model_response;
    prompt = firstResponse.prompt;
    rawResponse = firstResponse.raw_response;
    model = firstResponse.model || results.model || 'Unknown Model';
  } else {
    // For manual scans and others
    modelResponse = results.model_response;
    prompt = results.prompt;
    rawResponse = results.raw_response;
    model = results.model || 'Unknown Model';
  }
  
  const dateOnly = new Date(scan.created_at).toLocaleDateString();
  const fullDateTime = new Date(scan.created_at).toLocaleString();

  // Format verbose Ollama data if available
  const formatVerboseData = () => {
    if (rawResponse?.request && rawResponse?.response) {
      return JSON.stringify({
        request: rawResponse.request,
        response: rawResponse.response
      }, null, 2);
    }
    return JSON.stringify(rawResponse, null, 2);
  };

  return (
    <TableRow>
      <TableCell>{formatScanType(scan.scan_type)}</TableCell>
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
        <Badge variant="outline" className="cursor-default">
          {model}
        </Badge>
      </TableCell>
      <TableCell className="border-l">
        <TruncatedCell
          content={prompt || 'No prompt available'}
          onContentClick={() => onContentClick("Prompt", prompt || 'No prompt available')}
        />
      </TableCell>
      <TableCell>
        <TruncatedCell
          content={modelResponse || 'No response available'}
          onContentClick={() => onContentClick("Response", modelResponse || 'No response available')}
        />
      </TableCell>
      <TableCell className="w-[100px] text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onContentClick("Raw Data", formatVerboseData())}
          >
            <FileJson className="h-4 w-4" />
          </Button>
          {model.toLowerCase().includes('ollama') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onContentClick("Verbose Ollama Details", formatVerboseData())}
            >
              <Terminal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell className="border-l">
        <CategoryBadge category={scan.category || 'Uncategorized'} />
      </TableCell>
      <TableCell>
        <VulnerabilityStatus isVulnerable={scan.is_vulnerable} />
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <HideButton scanId={scan.id} onHide={onHide} />
        </div>
      </TableCell>
    </TableRow>
  );
};