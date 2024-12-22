export interface FingerPrintResult {
  capabilities?: string;
  boundaries?: string;
  training?: string;
  languages?: string;
  safety?: string;
}

export interface CustomEndpointConfig {
  curlCommand: string;
  placeholder: string;
}