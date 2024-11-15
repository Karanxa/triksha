import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TruncatedCellProps {
  content: string;
  title: string;
  onContentClick: (title: string, content: string) => void;
}

export const TruncatedCell = ({ content, title, onContentClick }: TruncatedCellProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="max-w-[200px] truncate cursor-pointer hover:text-primary"
          onClick={() => onContentClick(title, content)}
        >
          {content}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-[300px] whitespace-normal">Click to view full content</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);