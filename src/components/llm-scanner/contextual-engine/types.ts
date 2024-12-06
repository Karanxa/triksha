export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderModel {
  value: string;
  label: string;
}

export interface ContextualConfig {
  provider: string;
  model: string;
  datasetId: string;
}

export interface DatasetOption {
  id: string;
  name: string;
  description: string | null;
}

export interface ContextualResult {
  capabilities: string;
  boundaries: string;
  training: string;
  languages: string;
  safety: string;
}

export type Phase = 'not_started' | 'fingerprinting' | 'dataset_analysis' | 'completed';