export interface FingerPrintResult {
  capabilities?: string;
  boundaries?: string;
  training?: string;
  languages?: string;
  safety?: string;
}

export interface ProcessedResult {
  originalPrompt: string;
  augmentedPrompt: string;
  modelResponse: string;
}