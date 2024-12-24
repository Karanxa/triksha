import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface BasicParameterValues {
  epochs: number;
  batchSize: number;
  learningRate: number;
}

export interface BasicParametersProps {
  value: BasicParameterValues;
  onChange: (value: BasicParameterValues) => void;
}

export const BasicParameters = ({ value, onChange }: BasicParametersProps) => {
  const handleChange = (field: keyof BasicParameterValues, newValue: string) => {
    onChange({
      ...value,
      [field]: Number(newValue)
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label className="text-foreground">Learning Rate</Label>
        <Input
          type="number"
          value={value.learningRate}
          onChange={(e) => handleChange('learningRate', e.target.value)}
          step="0.0001"
          min="0"
          className="bg-white/5 border-white/10 text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Batch Size</Label>
        <Input
          type="number"
          value={value.batchSize}
          onChange={(e) => handleChange('batchSize', e.target.value)}
          min="1"
          className="bg-white/5 border-white/10 text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Epochs</Label>
        <Input
          type="number"
          value={value.epochs}
          onChange={(e) => handleChange('epochs', e.target.value)}
          min="1"
          className="bg-white/5 border-white/10 text-foreground"
        />
      </div>
    </div>
  );
};