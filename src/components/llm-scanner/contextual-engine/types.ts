export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ProviderModel {
  value: string;
  label: string;
}

export interface ContextualConfig {
  provider: string;
  model: string;
  datasetId: string;
  customEndpoint?: {
    url: string;
    apiKey: string;
    headers: string;
    method: string;
    inputType: 'curl' | 'http' | 'manual';
    placeholder?: string;
    httpRequest?: string;
    curlCommand?: string;
  };
}

export interface DatasetOption {
  id: string;
  name: string;
  description: string | null;
}

export interface FingerPrintResult {
  capabilities: string;
  boundaries: string;
  training: string;
  languages: string;
  safety: string;
}

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  github?: string;
  huggingface?: string;
  ollama_endpoint?: string;
}

export type Phase = 'not_started' | 'fingerprinting' | 'dataset_analysis' | 'completed';
