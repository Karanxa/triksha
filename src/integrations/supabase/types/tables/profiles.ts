import { Json } from '../common';

export interface ProfilesTable {
  Row: {
    id: string;
    created_at: string;
    updated_at: string;
    api_keys: Json | null;
  };
  Insert: {
    id: string;
    created_at?: string;
    updated_at?: string;
    api_keys?: Json | null;
  };
  Update: {
    id?: string;
    created_at?: string;
    updated_at?: string;
    api_keys?: Json | null;
  };
}