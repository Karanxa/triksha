import { Json } from '../common';

export interface IntegrationSettingsTable {
  Row: {
    id: string;
    user_id: string;
    provider: string;
    settings: Json;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    provider: string;
    settings?: Json;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    provider?: string;
    settings?: Json;
    created_at?: string;
    updated_at?: string;
  };
}