import { Json } from '../common';

export interface LLMScanResultsTable {
  Row: {
    id: string;
    user_id: string;
    batch_id: string | null;
    prompt: string;
    model_response: string | null;
    raw_response: Json | null;
    provider: string;
    model: string;
    category: string;
    severity: string | null;
    is_vulnerable: boolean | null;
    error: string | null;
    metadata: Json | null;
    created_at: string;
    updated_at: string;
    scan_id: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    batch_id?: string | null;
    prompt: string;
    model_response?: string | null;
    raw_response?: Json | null;
    provider: string;
    model: string;
    category: string;
    severity?: string | null;
    is_vulnerable?: boolean | null;
    error?: string | null;
    metadata?: Json | null;
    created_at?: string;
    updated_at?: string;
    scan_id?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    batch_id?: string | null;
    prompt?: string;
    model_response?: string | null;
    raw_response?: Json | null;
    provider?: string;
    model?: string;
    category?: string;
    severity?: string | null;
    is_vulnerable?: boolean | null;
    error?: string | null;
    metadata?: Json | null;
    created_at?: string;
    updated_at?: string;
    scan_id?: string | null;
  };
}