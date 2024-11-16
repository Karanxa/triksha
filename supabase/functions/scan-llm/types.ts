export interface CustomEndpoint {
  url: string;
  apiKey: string;
  headers: string;
  placeholder: string;
  curlCommand: string;
  inputType: 'curl' | 'manual';
}

export interface ScanRequest {
  scanId: string;
  prompts: string[];
  provider: string;
  category: string;
  customEndpoint?: CustomEndpoint;
}

export interface ScanResponse {
  prompt: string;
  model_response: string;
  category?: string;
  is_vulnerable?: boolean;
  error?: string;
}