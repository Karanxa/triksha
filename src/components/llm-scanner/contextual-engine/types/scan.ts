import { Message } from "../types";
import { Json } from "@/integrations/supabase/types";

export interface ScanConfig {
  provider: string;
  model: string;
  datasetId: string;
}

export interface DatasetPromptResult {
  success: boolean;
  response?: string;
  isVulnerable?: boolean;
}

export interface ContextualScanData {
  user_id: string;
  provider: string;
  model: string;
  messages: Json;
  is_vulnerable?: boolean | null;
  fingerprint_results?: Json | null;
}

// Helper function to convert Message[] to Json
export const messagesToJson = (messages: Message[]): Json => {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  })) as Json;
};