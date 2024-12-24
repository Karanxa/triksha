export type ScanPhase = 'fingerprinting' | 'augmenting' | 'redteaming';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

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

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  gemini?: string;
}