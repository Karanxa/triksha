export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AnalysisConfig {
  provider: string;
  model: string;
  datasetId: string;
  customEndpoint?: {
    url: string;
    apiKey: string;
    headers: string;
    method: string;
  };
}

export interface ScanResults {
  capabilities?: string;
  boundaries?: string;
  training?: string;
  languages?: string;
  safety?: string;
}