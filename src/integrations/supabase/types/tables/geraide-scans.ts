import { Json } from '../common';

export interface GeraideScanTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    provider: string;
    model: string;
    dataset_id: string | null;
    status: string;
    results: Json | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    provider: string;
    model?: string;
    dataset_id?: string | null;
    status?: string;
    results?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    provider?: string;
    model?: string;
    dataset_id?: string | null;
    status?: string;
    results?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
}