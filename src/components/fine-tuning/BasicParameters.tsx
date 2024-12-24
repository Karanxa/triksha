import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface BasicParameterValues {
  epochs: number;
  batchSize: number;
  learningRate: number;
}

export interface BasicParametersProps {
  value: BasicParameterValues;
  onChange: (value: BasicParameterValues) => void;
}

export const BasicParameters: React.FC<BasicParametersProps> = ({ value, onChange }) => {
  const handleChange = (field: keyof BasicParameterValues, newValue: string) => {
    onChange({
      ...value,
      [field]: Number(newValue)
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Learning Rate</Label>
        <Input
          type="number"
          value={value.learningRate}
          onChange={(e) => handleChange('learningRate', e.target.value)}
          step="0.0001"
          min="0"
          className="bg-background text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label>Batch Size</Label>
        <Input
          type="number"
          value={value.batchSize}
          onChange={(e) => handleChange('batchSize', e.target.value)}
          min="1"
          className="bg-background text-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label>Epochs</Label>
        <Input
          type="number"
          value={value.epochs}
          onChange={(e) => handleChange('epochs', e.target.value)}
          min="1"
          className="bg-background text-foreground"
        />
      </div>
    </div>
  );
};