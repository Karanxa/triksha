import { Database } from "@/integrations/supabase/types";

export type LLMScan = Database['public']['Tables']['llm_scans']['Row'];

export interface ScanResponse {
  prompt?: string;
  model_response?: string;
  raw_response?: any;
  error?: string;
}

export interface ScanResults {
  prompts?: string[];
  responses?: ScanResponse[];
}