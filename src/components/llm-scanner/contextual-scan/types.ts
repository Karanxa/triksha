export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ScanConfig {
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

export interface FingerPrintResult {
  capabilities: string;
  boundaries: string;
  training: string;
  languages: string;
  safety: string;
}

export type Phase = 'not_started' | 'fingerprinting' | 'dataset_analysis' | 'completed';