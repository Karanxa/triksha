import { Database } from "@/integrations/supabase/types";

export type LLMScan = Database['public']['Tables']['llm_scans']['Row'] & {
  results?: ScanResults | null;
  scan_type?: string;
  model?: string;
};

export interface ScanResults {
  prompts?: string[];
  prompt?: string;
  responses?: ScanResponse[];
  model_response?: string;
  response?: string;
  timestamp?: string;
}

export interface ScanResponse {
  prompt: string;
  model_response?: string;
  response?: string;
  raw_response?: any;
  error?: string;
  timestamp?: string;
  model?: string;
}

export interface TruncatedCellProps {
  content: string;
  onContentClick: () => void;
}

export type ScanType = 'manual_scan' | 'batch_scan' | 'garak' | 'prompt_fuzzer';