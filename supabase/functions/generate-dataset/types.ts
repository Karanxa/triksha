export interface FingerPrintResult {
  capabilities?: string;
  boundaries?: string;
  training?: string;
  languages?: string;
  safety?: string;
}

export interface GenerateDatasetRequest {
  name: string;
  description?: string;
  originalPrompts: string[];
  provider: string;
  model: string;
  fingerprintResults: FingerPrintResult;
}

export interface TestResult {
  prompt: string;
  response: string;
  error?: string;
}