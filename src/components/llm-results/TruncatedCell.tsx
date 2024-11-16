import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TruncatedCellProps {
  content?: string;
  title: string;
  onContentClick: (title: string, content: string) => void;
}

export const TruncatedCell = ({ content = "N/A", title, onContentClick }: TruncatedCellProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="max-w-[200px] truncate cursor-pointer hover:text-primary transition-colors"
          onClick={() => onContentClick(title, content)}
        >
          {content}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-[400px]">
        <ScrollArea className="h-[100px]">
          <p className="whitespace-pre-wrap">{content}</p>
        </ScrollArea>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);