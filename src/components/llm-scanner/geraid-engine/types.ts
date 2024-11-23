export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderModel {
  value: string;
  label: string;
}

export interface GeraidResponse {
  capabilities: string;
  boundaries: string;
  training: string;
  languages: string;
  safety: string;
}