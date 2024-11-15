import { Json } from '../common';

export interface FineTuningJobsTable {
  Row: {
    id: string;
    user_id: string;
    model: string;
    dataset_id: string | null;
    status: string;
    parameters: Json | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    model: string;
    dataset_id?: string | null;
    status?: string;
    parameters?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    model?: string;
    dataset_id?: string | null;
    status?: string;
    parameters?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
}