export interface FingerPrintResult {
  capabilities?: string;
  boundaries?: string;
  training?: string;
  languages?: string;
  safety?: string;
}

export interface CustomEndpointConfig {
  url: string;
  method: string;
  inputType: 'curl' | 'http' | 'manual';
  placeholder?: string;
  headers?: string;
  httpRequest?: string;
  apiKey?: string;
}