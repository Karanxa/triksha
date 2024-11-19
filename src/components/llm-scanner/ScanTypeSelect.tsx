import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ScanTypeSelectProps {
  scanType: string;
  onScanTypeChange: (value: string) => void;
}

export const ScanTypeSelect = ({ scanType, onScanTypeChange }: ScanTypeSelectProps) => {
  return (
    <div className="space-y-4">
      <Label className="text-base">Select Scan Type</Label>
      <RadioGroup 
        value={scanType} 
        onValueChange={onScanTypeChange} 
        className="flex flex-col space-y-3"
      >
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="manual" id="manual" />
          <Label 
            htmlFor="manual" 
            className="text-sm leading-tight"
          >
            Manual Scan (Single Prompt)
          </Label>
        </div>
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="batch" id="batch" />
          <Label 
            htmlFor="batch" 
            className="text-sm leading-tight"
          >
            Batch Scan (Multiple Prompts)
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};