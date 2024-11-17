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
          className="max-w-[200px] truncate cursor-pointer hover:text-primary transition-colors break-all line-clamp-2 text-sm"
          onClick={onContentClick}
        >
          {content}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-[300px]">
        <ScrollArea className="h-[200px]">
          <p className="whitespace-pre-wrap break-words text-sm">{content}</p>
        </ScrollArea>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);