import { Json } from '../common';

export interface LLMScansTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    results: Json | null;
    category: string | null;
    label: string | null;
    schedule: string | null;
    is_recurring: boolean | null;
    next_run: string | null;
    severity: string | null;
    is_vulnerable: boolean | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    results?: Json | null;
    category?: string | null;
    label?: string | null;
    schedule?: string | null;
    is_recurring?: boolean | null;
    next_run?: string | null;
    severity?: string | null;
    is_vulnerable?: boolean | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    results?: Json | null;
    category?: string | null;
    label?: string | null;
    schedule?: string | null;
    is_recurring?: boolean | null;
    next_run?: string | null;
    severity?: string | null;
    is_vulnerable?: boolean | null;
  };
}