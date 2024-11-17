import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TruncatedCellProps {
  content: string;
  onContentClick: () => void;
}

export const TruncatedCell = ({ content = "N/A", onContentClick }: TruncatedCellProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="max-w-[200px] truncate cursor-pointer hover:text-primary transition-colors break-all whitespace-pre-wrap line-clamp-1"
          onClick={onContentClick}
        >
          {content}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-[400px]">
        <ScrollArea className="h-[300px]">
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </ScrollArea>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);