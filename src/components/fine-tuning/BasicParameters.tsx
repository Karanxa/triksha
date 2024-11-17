import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface BasicParametersProps {
  learningRate: string;
  setLearningRate: (value: string) => void;
  batchSize: string;
  setBatchSize: (value: string) => void;
  epochs: string;
  setEpochs: (value: string) => void;
  warmupSteps: string;
  setWarmupSteps: (value: string) => void;
  weightDecay: string;
  setWeightDecay: (value: string) => void;
  optimizer: string;
  setOptimizer: (value: string) => void;
  scheduler: string;
  setScheduler: (value: string) => void;
  maxSteps: string;
  setMaxSteps: (value: string) => void;
  evaluationStrategy: string;
  setEvaluationStrategy: (value: string) => void;
  saveStrategy: string;
  setSaveStrategy: (value: string) => void;
  randomSeed: string;
  setRandomSeed: (value: string) => void;
}

export const BasicParameters: React.FC<BasicParametersProps> = ({
  learningRate,
  setLearningRate,
  batchSize,
  setBatchSize,
  epochs,
  setEpochs,
  warmupSteps,
  setWarmupSteps,
  weightDecay,
  setWeightDecay,
  optimizer,
  setOptimizer,
  scheduler,
  setScheduler,
  maxSteps,
  setMaxSteps,
  evaluationStrategy,
  setEvaluationStrategy,
  saveStrategy,
  setSaveStrategy,
  randomSeed,
  setRandomSeed,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="learning-rate">Learning Rate</Label>
        <Input
          id="learning-rate"
          type="number"
          value={learningRate}
          onChange={(e) => setLearningRate(e.target.value)}
          step="0.0001"
          min="0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="batch-size">Batch Size</Label>
        <Input
          id="batch-size"
          type="number"
          value={batchSize}
          onChange={(e) => setBatchSize(e.target.value)}
          min="1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="epochs">Epochs</Label>
        <Input
          id="epochs"
          type="number"
          value={epochs}
          onChange={(e) => setEpochs(e.target.value)}
          min="1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="warmup-steps">Warmup Steps</Label>
        <Input
          id="warmup-steps"
          type="number"
          value={warmupSteps}
          onChange={(e) => setWarmupSteps(e.target.value)}
          min="0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="weight-decay">Weight Decay</Label>
        <Input
          id="weight-decay"
          type="number"
          value={weightDecay}
          onChange={(e) => setWeightDecay(e.target.value)}
          step="0.01"
          min="0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="optimizer">Optimizer</Label>
        <Select value={optimizer} onValueChange={setOptimizer}>
          <SelectTrigger id="optimizer">
            <SelectValue placeholder="Select optimizer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="adamw">AdamW</SelectItem>
            <SelectItem value="adam">Adam</SelectItem>
            <SelectItem value="sgd">SGD</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="scheduler">Scheduler</Label>
        <Select value={scheduler} onValueChange={setScheduler}>
          <SelectTrigger id="scheduler">
            <SelectValue placeholder="Select scheduler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="cosine">Cosine</SelectItem>
            <SelectItem value="constant">Constant</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="max-steps">Max Steps</Label>
        <Input
          id="max-steps"
          type="number"
          value={maxSteps}
          onChange={(e) => setMaxSteps(e.target.value)}
          min="1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="evaluation-strategy">Evaluation Strategy</Label>
        <Select value={evaluationStrategy} onValueChange={setEvaluationStrategy}>
          <SelectTrigger id="evaluation-strategy">
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="steps">Steps</SelectItem>
            <SelectItem value="epoch">Epoch</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="save-strategy">Save Strategy</Label>
        <Select value={saveStrategy} onValueChange={setSaveStrategy}>
          <SelectTrigger id="save-strategy">
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="steps">Steps</SelectItem>
            <SelectItem value="epoch">Epoch</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="random-seed">Random Seed</Label>
        <Input
          id="random-seed"
          type="number"
          value={randomSeed}
          onChange={(e) => setRandomSeed(e.target.value)}
          min="0"
        />
      </div>
    </div>
  );
};