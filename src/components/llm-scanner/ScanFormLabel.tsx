import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ScanFormLabelProps {
  label: string;
  onLabelChange: (value: string) => void;
}

export const ScanFormLabel = ({ label, onLabelChange }: ScanFormLabelProps) => {
  return (
    <div className="space-y-4">
      <Label>Scan Label (Optional)</Label>
      <Input 
        placeholder="Enter a label for this scan"
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
      />
    </div>
  );
};