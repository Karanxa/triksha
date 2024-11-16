import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InfoCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QPSControlProps {
  qps: number;
  onQPSChange: (value: number) => void;
}

export const QPSControl = ({ qps, onQPSChange }: QPSControlProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>Queries Per Second</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <InfoCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Higher QPS means faster scanning but may increase error rates</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        type="number"
        min={1}
        max={50}
        value={qps}
        onChange={(e) => onQPSChange(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
        placeholder="Enter QPS (1-50)"
      />
    </div>
  );
};