import { Json } from '../common';

export interface ScheduledLLMScansTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    provider: string;
    model: string;
    prompts: Json;
    schedule: string;
    is_active: boolean | null;
    last_run: string | null;
    next_run: string | null;
    custom_endpoint: Json | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    description?: string | null;
    provider: string;
    model: string;
    prompts: Json;
    schedule: string;
    is_active?: boolean | null;
    last_run?: string | null;
    next_run?: string | null;
    custom_endpoint?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    description?: string | null;
    provider?: string;
    model?: string;
    prompts?: Json;
    schedule?: string;
    is_active?: boolean | null;
    last_run?: string | null;
    next_run?: string | null;
    custom_endpoint?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
}