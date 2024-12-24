export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  [key: string]: string | undefined;
}