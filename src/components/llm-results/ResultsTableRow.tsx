import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { DeleteButton } from "./DeleteButton";
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

const getFullModelName = (provider: string, model: string): string => {
  switch (provider?.toLowerCase()) {
    case 'openai':
      return model === 'gpt-4o' ? 'GPT-4 Opus' :
             model === 'gpt-4o-mini' ? 'GPT-4 Opus Mini' :
             model;
    case 'anthropic':
      return model === 'claude-3-opus-20240229' ? 'Claude 3 Opus' :
             model === 'claude-3-sonnet-20240229' ? 'Claude 3 Sonnet' :
             model;
    case 'google':
      return model === 'gemini-1.0-pro' ? 'Gemini Pro' :
             model === 'gemini-1.0-ultra' ? 'Gemini Ultra' :
             model;
    case 'ollama':
      return model === 'llama2' ? 'Llama 2' :
             model === 'mistral' ? 'Mistral' :
             model === 'codellama' ? 'Code Llama' :
             model;
    default:
      return model || 'Unknown Model';
  }
};

interface ResultsTableRowProps {
  scan: LLMScan;
  formatDate: (date: string) => string;
  onContentClick: (title: string, content: string) => void;
}

export const ResultsTableRow = ({ scan, formatDate, onContentClick }: ResultsTableRowProps) => {
  const results = scan.results || {};
  const responses = Array.isArray(results.responses) ? results.responses[0] : results;
  
  const prompt = responses?.prompt || results.prompt || 'No prompt available';
  const response = responses?.model_response || results.model_response || 'No response available';
  const rawResponse = responses || results;
  const category = scan.category || 'Uncategorized';
  const isVulnerable = scan.is_vulnerable;
  
  const provider = responses?.provider || results.provider || 'Unknown Provider';
  const modelName = responses?.model || results.model || 'Unknown Model';
  const fullModelName = getFullModelName(provider, modelName);

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
              <p>{provider}</p>
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
          <DeleteButton scanId={scan.id} />
        </div>
      </TableCell>
    </TableRow>
  );
};