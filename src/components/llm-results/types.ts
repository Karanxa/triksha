export type ScanType = 'manual_scan' | 'batch_scan' | 'garak' | 'prompt_fuzzer';

export interface ScanResponse {
  prompt: string;
  model_response?: string;
  response?: string;
  raw_response?: any;
  error?: string;
  is_vulnerable?: boolean;
  model?: string;
  category?: string;
}

export interface LLMScan {
  id: string;
  user_id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  results: {
    responses?: ScanResponse[];
    prompts?: string[];
    model?: string;
    progress?: number;
    error?: string;
    model_response?: string;
    prompt?: string;
    raw_response?: any;
  };
  category: string | null;
  label: string | null;
  schedule: string | null;
  is_recurring: boolean | null;
  next_run: string | null;
  severity: string | null;
  is_vulnerable: boolean | null;
  scan_type: ScanType | null;
}