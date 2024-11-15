import { Json } from './common';

export interface Database {
  public: {
    Tables: {
      datasets: {
        Row: {
          created_at: string;
          description: string | null;
          file_path: string | null;
          id: string;
          name: string;
          updated_at: string;
          user_id: string;
          category: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          file_path?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
          category?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          file_path?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
          category?: string | null;
        };
      };
      fine_tuning_jobs: {
        Row: {
          created_at: string;
          dataset_id: string | null;
          id: string;
          model: string;
          parameters: Json | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          dataset_id?: string | null;
          id?: string;
          model: string;
          parameters?: Json | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          dataset_id?: string | null;
          id?: string;
          model?: string;
          parameters?: Json | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      llm_scans: {
        Row: {
          category: string | null;
          created_at: string;
          id: string;
          is_recurring: boolean | null;
          is_vulnerable: boolean | null;
          label: string | null;
          name: string;
          next_run: string | null;
          results: Json | null;
          schedule: string | null;
          severity: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          id?: string;
          is_recurring?: boolean | null;
          is_vulnerable?: boolean | null;
          label?: string | null;
          name: string;
          next_run?: string | null;
          results?: Json | null;
          schedule?: string | null;
          severity?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          id?: string;
          is_recurring?: boolean | null;
          is_vulnerable?: boolean | null;
          label?: string | null;
          name?: string;
          next_run?: string | null;
          results?: Json | null;
          schedule?: string | null;
          severity?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      profiles: {
        Row: {
          api_keys: Json | null;
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          api_keys?: Json | null;
          created_at?: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          api_keys?: Json | null;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
      };
      prompts: {
        Row: {
          augmented_text: string | null;
          created_at: string;
          id: string;
          keyword: string | null;
          original_text: string;
          provider: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          augmented_text?: string | null;
          created_at?: string;
          id?: string;
          keyword?: string | null;
          original_text: string;
          provider?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          augmented_text?: string | null;
          created_at?: string;
          id?: string;
          keyword?: string | null;
          original_text?: string;
          provider?: string | null;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}