import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BasicParametersProps {
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

export const BasicParameters = ({
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
}: BasicParametersProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Learning Rate</Label>
        <Input
          type="text"
          value={learningRate}
          onChange={(e) => setLearningRate(e.target.value)}
        />
      </div>
      <div>
        <Label>Batch Size</Label>
        <Input
          type="text"
          value={batchSize}
          onChange={(e) => setBatchSize(e.target.value)}
        />
      </div>
      <div>
        <Label>Epochs</Label>
        <Input
          type="text"
          value={epochs}
          onChange={(e) => setEpochs(e.target.value)}
        />
      </div>
      <div>
        <Label>Warmup Steps</Label>
        <Input
          type="text"
          value={warmupSteps}
          onChange={(e) => setWarmupSteps(e.target.value)}
        />
      </div>
      <div>
        <Label>Weight Decay</Label>
        <Input
          type="text"
          value={weightDecay}
          onChange={(e) => setWeightDecay(e.target.value)}
        />
      </div>
      <div>
        <Label>Optimizer</Label>
        <Input
          type="text"
          value={optimizer}
          onChange={(e) => setOptimizer(e.target.value)}
        />
      </div>
      <div>
        <Label>Scheduler</Label>
        <Input
          type="text"
          value={scheduler}
          onChange={(e) => setScheduler(e.target.value)}
        />
      </div>
      <div>
        <Label>Max Steps</Label>
        <Input
          type="text"
          value={maxSteps}
          onChange={(e) => setMaxSteps(e.target.value)}
        />
      </div>
      <div>
        <Label>Evaluation Strategy</Label>
        <Input
          type="text"
          value={evaluationStrategy}
          onChange={(e) => setEvaluationStrategy(e.target.value)}
        />
      </div>
      <div>
        <Label>Save Strategy</Label>
        <Input
          type="text"
          value={saveStrategy}
          onChange={(e) => setSaveStrategy(e.target.value)}
        />
      </div>
      <div>
        <Label>Random Seed</Label>
        <Input
          type="text"
          value={randomSeed}
          onChange={(e) => setRandomSeed(e.target.value)}
        />
      </div>
    </div>
  );
};
