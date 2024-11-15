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
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          file_path?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          file_path?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
          user_id?: string;
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
          created_at: string;
          id: string;
          name: string;
          results: Json | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          results?: Json | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          results?: Json | null;
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