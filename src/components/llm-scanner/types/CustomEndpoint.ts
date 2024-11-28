export interface CustomEndpoint {
  url: string;
  apiKey: string;
  headers: string;
  method: string;
  inputType: 'curl' | 'http' | 'manual';
  placeholder?: string;
  httpRequest?: string;
  curlCommand?: string;
}