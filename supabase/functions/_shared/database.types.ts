export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      model_fingerprint_sessions: {
        Row: {
          id: string
          user_id: string
          dataset_id: string
          provider: string
          model: string
          status: string
          results: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dataset_id: string
          provider: string
          model: string
          status?: string
          results?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dataset_id?: string
          provider?: string
          model?: string
          status?: string
          results?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      model_fingerprint_messages: {
        Row: {
          id: string
          session_id: string
          role: 'system' | 'user' | 'assistant'
          content: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'system' | 'user' | 'assistant'
          content: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'system' | 'user' | 'assistant'
          content?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      model_fingerprint_role: 'system' | 'user' | 'assistant'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}