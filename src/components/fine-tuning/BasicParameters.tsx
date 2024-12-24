import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface BasicParameterValues {
  learningRate: string;
  batchSize: string;
  epochs: string;
  warmupSteps: string;
  weightDecay: string;
  optimizer: string;
  scheduler: string;
  maxSteps: string;
  evaluationStrategy: string;
  saveStrategy: string;
  randomSeed: string;
}

export interface BasicParametersProps {
  value: BasicParameterValues;
  onChange: (values: BasicParameterValues) => void;
}

export const BasicParameters = ({
  value,
  onChange
}: BasicParametersProps) => {
  const handleChange = (field: keyof BasicParameterValues, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Learning Rate</Label>
        <Input
          type="text"
          value={value.learningRate}
          onChange={(e) => handleChange('learningRate', e.target.value)}
        />
      </div>
      <div>
        <Label>Batch Size</Label>
        <Input
          type="text"
          value={value.batchSize}
          onChange={(e) => handleChange('batchSize', e.target.value)}
        />
      </div>
      <div>
        <Label>Epochs</Label>
        <Input
          type="text"
          value={value.epochs}
          onChange={(e) => handleChange('epochs', e.target.value)}
        />
      </div>
      <div>
        <Label>Warmup Steps</Label>
        <Input
          type="text"
          value={value.warmupSteps}
          onChange={(e) => handleChange('warmupSteps', e.target.value)}
        />
      </div>
      <div>
        <Label>Weight Decay</Label>
        <Input
          type="text"
          value={value.weightDecay}
          onChange={(e) => handleChange('weightDecay', e.target.value)}
        />
      </div>
      <div>
        <Label>Optimizer</Label>
        <Input
          type="text"
          value={value.optimizer}
          onChange={(e) => handleChange('optimizer', e.target.value)}
        />
      </div>
      <div>
        <Label>Scheduler</Label>
        <Input
          type="text"
          value={value.scheduler}
          onChange={(e) => handleChange('scheduler', e.target.value)}
        />
      </div>
      <div>
        <Label>Max Steps</Label>
        <Input
          type="text"
          value={value.maxSteps}
          onChange={(e) => handleChange('maxSteps', e.target.value)}
        />
      </div>
      <div>
        <Label>Evaluation Strategy</Label>
        <Input
          type="text"
          value={value.evaluationStrategy}
          onChange={(e) => handleChange('evaluationStrategy', e.target.value)}
        />
      </div>
      <div>
        <Label>Save Strategy</Label>
        <Input
          type="text"
          value={value.saveStrategy}
          onChange={(e) => handleChange('saveStrategy', e.target.value)}
        />
      </div>
      <div>
        <Label>Random Seed</Label>
        <Input
          type="text"
          value={value.randomSeed}
          onChange={(e) => handleChange('randomSeed', e.target.value)}
        />
      </div>
    </div>
  );
};