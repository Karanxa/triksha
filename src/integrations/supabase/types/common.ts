export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface ApiKeys {
  [key: string]: string | undefined;
  openai?: string;
  huggingface?: string;
  anthropic?: string;
  gemini?: string;
  github?: string;
}