export interface ScriptParameters {
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
  precision: string;
  gradientAccumulation: string;
  useDeepSpeed: boolean;
  useFlashAttention: boolean;
  useMemoryOptimization: boolean;
  hardwareAcceleration: string;
}

export interface GenerateScriptParams {
  model: string;
  datasetId: string;
  taskType: string;
  scriptLanguage: string;
  parameters: ScriptParameters;
}