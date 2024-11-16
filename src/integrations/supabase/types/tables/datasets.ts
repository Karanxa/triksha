import { Json } from '../common';

export interface DatasetsTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    file_path: string | null;
    created_at: string;
    updated_at: string;
    category: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    description?: string | null;
    file_path?: string | null;
    created_at?: string;
    updated_at?: string;
    category?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    description?: string | null;
    file_path?: string | null;
    created_at?: string;
    updated_at?: string;
    category?: string | null;
  };
}