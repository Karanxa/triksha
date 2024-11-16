import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScanFormHeaderProps {
  scanType: "manual" | "batch";
  onScanTypeChange: (value: "manual" | "batch") => void;
}

export const ScanFormHeader = ({ scanType, onScanTypeChange }: ScanFormHeaderProps) => {
  return (
    <div className="space-y-4">
      <Label>Scan Type</Label>
      <Select value={scanType} onValueChange={onScanTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select scan type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="manual">Manual Scan</SelectItem>
          <SelectItem value="batch">Batch Scan</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};