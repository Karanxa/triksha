import { TableCell, TableRow } from "@/components/ui/table";
import { TruncatedCell } from "./TruncatedCell";
import { DeleteButton } from "./DeleteButton";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import { CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";

type LLMScan = Database['public']['Tables']['llm_scans']['Row'];

interface ResultsTableRowProps {
  scan: LLMScan;
  formatDate: (date: string) => string;
  onContentClick: (title: string, content: string) => void;
}

export const ResultsTableRow = ({ scan, formatDate, onContentClick }: ResultsTableRowProps) => {
  // Parse the results array from the scan
  const results = scan.results as {
    prompt: string;
    model_response: string;
    analysis?: {
      category?: string;
      risk_level?: string;
      summary?: string;
    };
  }[] | null;

  // Get the first result if it exists
  const firstResult = results?.[0] || null;
  
  const prompt = firstResult?.prompt || 'No prompt';
  const response = firstResult?.model_response || 'No response';
  const category = scan.category || 'uncategorized';
  const label = scan.label || 'No label';
  const riskLevel = firstResult?.analysis?.risk_level || 'unknown';

  const getCategoryVariant = (category: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (category.toLowerCase()) {
      case 'prompt-injection':
        return 'destructive';
      case 'data-leakage':
        return 'secondary';
      case 'bias':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getRiskLevelBadge = (level: string) => {
    const variants = {
      high: { color: 'destructive' as const, icon: XCircle },
      medium: { color: 'secondary' as const, icon: AlertTriangle },
      low: { color: 'default' as const, icon: CheckCircle2 },
      unknown: { color: 'secondary' as const, icon: Clock },
    };

    const { color, icon: Icon } = variants[level.toLowerCase() as keyof typeof variants] || variants.unknown;
    
    return (
      <Badge variant={color} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

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
          {getRiskLevelBadge(riskLevel)}
        </div>
      </TableCell>
      <TableCell>{label}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <DeleteButton scanId={scan.id} />
        </div>
      </TableCell>
    </TableRow>
  );
};