import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParameterValues {
  epochs: number;
  batchSize: number;
  learningRate: number;
}

export interface BasicParametersProps {
  value: ParameterValues;
  onChange: (value: ParameterValues) => void;
}

export const BasicParameters: React.FC<BasicParametersProps> = ({
  value,
  onChange
}) => {
  const handleChange = (field: keyof ParameterValues, newValue: string) => {
    onChange({
      ...value,
      [field]: Number(newValue)
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="learning-rate">Learning Rate</Label>
        <Input
          id="learning-rate"
          type="number"
          value={value.learningRate}
          onChange={(e) => handleChange('learningRate', e.target.value)}
          step="0.0001"
          min="0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="batch-size">Batch Size</Label>
        <Input
          id="batch-size"
          type="number"
          value={value.batchSize}
          onChange={(e) => handleChange('batchSize', e.target.value)}
          min="1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="epochs">Epochs</Label>
        <Input
          id="epochs"
          type="number"
          value={value.epochs}
          onChange={(e) => handleChange('epochs', e.target.value)}
          min="1"
        />
      </div>
    </div>
  );
};