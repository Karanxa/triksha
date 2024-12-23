import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Scan, ListChecks } from "lucide-react";

interface ScanTypeSelectProps {
  scanType: string;
  onScanTypeChange: (value: string) => void;
}

export const ScanTypeSelect = ({ scanType, onScanTypeChange }: ScanTypeSelectProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Select Scan Type</Label>
      <RadioGroup 
        value={scanType} 
        onValueChange={onScanTypeChange} 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <label
          className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all
            ${scanType === 'manual' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
        >
          <RadioGroupItem value="manual" id="manual" className="mt-1" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Scan className="w-4 h-4 text-primary" />
              <span className="font-medium">Manual Scan</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Test a single prompt for vulnerabilities
            </p>
          </div>
        </label>

        <label
          className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all
            ${scanType === 'batch' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
        >
          <RadioGroupItem value="batch" id="batch" className="mt-1" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" />
              <span className="font-medium">Batch Scan</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Process multiple prompts in one go
            </p>
          </div>
        </label>
      </RadioGroup>
    </div>
  );
};