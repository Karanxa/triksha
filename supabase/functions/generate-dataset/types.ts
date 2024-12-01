export interface FingerPrintResult {
  capabilities?: string;
  boundaries?: string;
  training?: string;
  languages?: string;
  safety?: string;
}

export interface AdversarialConfig {
  attackType: string;
  vulnerabilityCategory: string;
  difficulty: string;
  severity: string;
  context: string;
}

export interface TestResult {
  prompt: string;
  response: string;
  error?: string;
}