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

// Helper type for converting AIProviderSettings to Json
export type AIProviderSettingsJson = {
  provider: string;
  model: string;
  customEndpoint: {
    url?: string;
    apiKey?: string;
    headers?: string;
    curlCommand?: string;
    placeholder?: string;
  } | null;
}