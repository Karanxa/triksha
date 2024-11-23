export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderModel {
  value: string;
  label: string;
}

export interface DatasetOption {
  id: string;
  name: string;
  description: string | null;
}

export interface GeraidConfig {
  provider: string;
  model: string;
  datasetId: string | null;
}