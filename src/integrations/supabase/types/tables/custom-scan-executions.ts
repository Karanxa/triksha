import { Json } from '../common';

export interface CustomScanExecutionsTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    model: string;
    status: string;
    results: Json | null;
    test_ids: string[];
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    model: string;
    status?: string;
    results?: Json | null;
    test_ids: string[];
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    model?: string;
    status?: string;
    results?: Json | null;
    test_ids?: string[];
    created_at?: string;
    updated_at?: string;
  };
}