import { Json, ApiKeys } from '../common';

export interface ProfilesTable {
  Row: {
    id: string;
    created_at: string;
    updated_at: string;
    api_keys: ApiKeys | null;
  };
  Insert: {
    id: string;
    created_at?: string;
    updated_at?: string;
    api_keys?: ApiKeys | null;
  };
  Update: {
    id?: string;
    created_at?: string;
    updated_at?: string;
    api_keys?: ApiKeys | null;
  };
}