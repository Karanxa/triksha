export interface CustomEndpoint {
  url?: string;
  apiKey?: string;
  headers?: string;
  curlCommand?: string;
  placeholder?: string;
}

export interface AIProviderSettings {
  provider: string;
  model: string;
  customEndpoint?: CustomEndpoint | null;
}