export interface FuzzerFormData {
  prompt: string;
  attackProvider: string;
  attackModel: string;
  targetProvider: string;
  targetModel: string;
  numAttempts: number;
  numThreads: number;
  attackTemperature: number;
  customBenchmark: string[];
  tests: string[];
}

export interface PromptFuzzerFormProps {
  onSubmit: (data: FuzzerFormData) => Promise<void>;
  isScanning: boolean;
}