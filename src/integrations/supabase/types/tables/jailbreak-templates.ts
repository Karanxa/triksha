import { Json } from '../common';

export interface JailbreakTemplatesTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    category: string;
    base_prompt: string;
    variables: Json | null;
    created_at: string;
    updated_at: string;
    is_public: boolean | null;
    success_rate: number | null;
    target_models: string[] | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    description?: string | null;
    category: string;
    base_prompt: string;
    variables?: Json | null;
    created_at?: string;
    updated_at?: string;
    is_public?: boolean | null;
    success_rate?: number | null;
    target_models?: string[] | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    description?: string | null;
    category?: string;
    base_prompt?: string;
    variables?: Json | null;
    created_at?: string;
    updated_at?: string;
    is_public?: boolean | null;
    success_rate?: number | null;
    target_models?: string[] | null;
  };
}