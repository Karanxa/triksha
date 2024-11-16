import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QPSControlProps {
  qps: number;
  onQPSChange: (value: number) => void;
}

export const QPSControl = ({ qps, onQPSChange }: QPSControlProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label>Queries Per Second (QPS)</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Control the rate of requests sent to the LLM API. Higher values may result in faster scanning but could be rate limited.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        type="number"
        min={1}
        max={50}
        value={qps}
        onChange={(e) => onQPSChange(parseInt(e.target.value) || 1)}
        className="max-w-[200px]"
      />
    </div>
  );
};