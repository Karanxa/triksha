export interface ContextualConfig {
  provider: string;
  model: string;
  datasetId: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface FingerPrintResult {
  capabilities: string;
  boundaries: string;
  training: string;
  languages: string;
  safety: string;
}