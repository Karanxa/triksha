import { Json } from '../common';

export interface GarakScansTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    model: string;
    prompts: Json;
    test_suites: string[];
    results: Json | null;
    status: string;
    config: Json | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    model: string;
    prompts: Json;
    test_suites: string[];
    results?: Json | null;
    status?: string;
    config?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    model?: string;
    prompts?: Json;
    test_suites?: string[];
    results?: Json | null;
    status?: string;
    config?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
}