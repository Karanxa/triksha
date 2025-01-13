import { Json } from "@/integrations/supabase/types";
import { Message } from "./phases";

export interface ScanConfig {
  provider: string;
  model: string;
  datasetId?: string;
}

export interface ContextualScanData {
  user_id: string;
  provider: string;
  model: string;
  messages: Json;
  is_vulnerable: boolean | null;
  fingerprint_results: any;
}

export interface AugmentedPrompt {
  original: string;
  augmented: string;
}

export interface ModelResponse {
  prompt: string;
  response: string;
  isVulnerable: boolean;
}

export const messagesToJson = (messages: Message[]): Json => {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  })) as Json;
};