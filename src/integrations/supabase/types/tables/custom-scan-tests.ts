import { Json } from '../common';

export interface CustomScanTestsTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    category: string;
    test_prompt: string;
    expected_behavior: string | null;
    validation_rules: Json | null;
    is_active: boolean | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    description?: string | null;
    category: string;
    test_prompt: string;
    expected_behavior?: string | null;
    validation_rules?: Json | null;
    is_active?: boolean | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    description?: string | null;
    category?: string;
    test_prompt?: string;
    expected_behavior?: string | null;
    validation_rules?: Json | null;
    is_active?: boolean | null;
    created_at?: string;
    updated_at?: string;
  };
}