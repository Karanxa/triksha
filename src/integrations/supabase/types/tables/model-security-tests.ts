import { Json } from '../common';

export interface ModelSecurityTestsTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    category: string;
    test_prompts: Json;
    expected_results: Json | null;
    is_public: boolean | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    description?: string | null;
    category: string;
    test_prompts: Json;
    expected_results?: Json | null;
    is_public?: boolean | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    description?: string | null;
    category?: string;
    test_prompts?: Json;
    expected_results?: Json | null;
    is_public?: boolean | null;
    created_at?: string;
    updated_at?: string;
  };
}