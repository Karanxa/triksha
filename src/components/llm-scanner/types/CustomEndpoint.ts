export interface CustomEndpoint {
  url: string;
  apiKey: string;
  headers: string;
  placeholder: string;
  curlCommand: string;
  httpRequest: string;
  inputType: 'curl' | 'manual' | 'http';
  method: string;
}