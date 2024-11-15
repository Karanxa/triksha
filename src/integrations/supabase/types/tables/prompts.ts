import { Json } from '../common';

export interface PromptsTable {
  Row: {
    id: string;
    user_id: string;
    original_text: string;
    augmented_text: string | null;
    keyword: string | null;
    provider: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    original_text: string;
    augmented_text?: string | null;
    keyword?: string | null;
    provider?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    original_text?: string;
    augmented_text?: string | null;
    keyword?: string | null;
    provider?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}