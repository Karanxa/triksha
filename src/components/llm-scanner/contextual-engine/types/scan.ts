import { Message } from "../types";

export type ScanPhase = 'fingerprinting' | 'redteaming';

export interface ScanState {
  messages: Message[];
  isLoading: boolean;
  currentStep: number;
  pendingQuestion: boolean;
  phase: ScanPhase;
  datasetPrompts: string[];
  currentDatasetPromptIndex: number;
}

export interface ScanConfig {
  provider: string;
  model: string;
  datasetId: string;
}