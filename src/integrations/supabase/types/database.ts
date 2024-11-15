export interface Database {
  public: {
    Tables: {
      datasets: {
        Row: {
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
      }
      fine_tuning_jobs: {
        Row: {
          created_at: string
          dataset_id: string | null
          id: string
          model: string
          parameters: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dataset_id?: string | null
          id?: string
          model: string
          parameters?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dataset_id?: string | null
          id?: string
          model?: string
          parameters?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
      }
      llm_scans: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
          results: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
          results?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
          results?: Json | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          api_keys: Json | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          api_keys?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          api_keys?: Json | null
        }
      }
      prompts: {
        Row: {
          id: string
          user_id: string
          original_text: string
          augmented_text: string | null
          keyword: string | null
          provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_text: string
          augmented_text?: string | null
          keyword?: string | null
          provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_text?: string
          augmented_text?: string | null
          keyword?: string | null
          provider?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}