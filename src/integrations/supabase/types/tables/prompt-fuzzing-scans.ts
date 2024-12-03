import { Json } from '../common';

export interface PromptFuzzingScansTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    base_prompt: string;
    fuzzing_type: string;
    mutations: Json | null;
    results: Json | null;
    status: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    base_prompt: string;
    fuzzing_type: string;
    mutations?: Json | null;
    results?: Json | null;
    status?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    base_prompt?: string;
    fuzzing_type?: string;
    mutations?: Json | null;
    results?: Json | null;
    status?: string;
    created_at?: string;
    updated_at?: string;
  };
}