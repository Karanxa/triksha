export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contextual_scans: {
        Row: {
          created_at: string
          dataset_analysis_results: Json | null
          fingerprint_results: Json | null
          id: string
          is_vulnerable: boolean | null
          messages: Json
          model: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dataset_analysis_results?: Json | null
          fingerprint_results?: Json | null
          id?: string
          is_vulnerable?: boolean | null
          messages?: Json
          model: string
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dataset_analysis_results?: Json | null
          fingerprint_results?: Json | null
          id?: string
          is_vulnerable?: boolean | null
          messages?: Json
          model?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contextual_scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_scan_executions: {
        Row: {
          created_at: string
          id: string
          model: string
          name: string
          results: Json | null
          status: string
          test_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model: string
          name: string
          results?: Json | null
          status?: string
          test_ids: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model?: string
          name?: string
          results?: Json | null
          status?: string
          test_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_scan_executions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_scan_tests: {
        Row: {
          category: Database["public"]["Enums"]["scan_test_category"]
          created_at: string
          description: string | null
          expected_behavior: string | null
          id: string
          is_active: boolean | null
          name: string
          test_prompt: string
          updated_at: string
          user_id: string
          validation_rules: Json | null
        }
        Insert: {
          category: Database["public"]["Enums"]["scan_test_category"]
          created_at?: string
          description?: string | null
          expected_behavior?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          test_prompt: string
          updated_at?: string
          user_id: string
          validation_rules?: Json | null
        }
        Update: {
          category?: Database["public"]["Enums"]["scan_test_category"]
          created_at?: string
          description?: string | null
          expected_behavior?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          test_prompt?: string
          updated_at?: string
          user_id?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_scan_tests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      datasets: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "datasets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fine_tuning_jobs: {
        Row: {
          advanced_parameters: Json | null
          created_at: string
          dataset_id: string | null
          google_job_id: string | null
          id: string
          metrics: Json | null
          model: string
          model_artifact_path: string | null
          parameters: Json | null
          script_content: string | null
          status: string
          training_logs: Json[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          advanced_parameters?: Json | null
          created_at?: string
          dataset_id?: string | null
          google_job_id?: string | null
          id?: string
          metrics?: Json | null
          model: string
          model_artifact_path?: string | null
          parameters?: Json | null
          script_content?: string | null
          status?: string
          training_logs?: Json[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          advanced_parameters?: Json | null
          created_at?: string
          dataset_id?: string | null
          google_job_id?: string | null
          id?: string
          metrics?: Json | null
          model?: string
          model_artifact_path?: string | null
          parameters?: Json | null
          script_content?: string | null
          status?: string
          training_logs?: Json[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fine_tuning_jobs_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fine_tuning_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      garak_scans: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          model: string
          name: string
          prompts: Json
          results: Json | null
          status: string
          test_suites: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          model: string
          name: string
          prompts: Json
          results?: Json | null
          status?: string
          test_suites: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          model?: string
          name?: string
          prompts?: Json
          results?: Json | null
          status?: string
          test_suites?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garak_scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          ai_provider_settings: Json | null
          created_at: string
          id: string
          provider: string
          settings: Json
          updated_at: string
          user_id: string
          vulnerability_detection_settings: Json | null
        }
        Insert: {
          ai_provider_settings?: Json | null
          created_at?: string
          id?: string
          provider: string
          settings?: Json
          updated_at?: string
          user_id: string
          vulnerability_detection_settings?: Json | null
        }
        Update: {
          ai_provider_settings?: Json | null
          created_at?: string
          id?: string
          provider?: string
          settings?: Json
          updated_at?: string
          user_id?: string
          vulnerability_detection_settings?: Json | null
        }
        Relationships: []
      }
      jailbreak_templates: {
        Row: {
          base_prompt: string
          category: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          success_rate: number | null
          target_models: string[] | null
          updated_at: string
          user_id: string
          variables: Json | null
        }
        Insert: {
          base_prompt: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          success_rate?: number | null
          target_models?: string[] | null
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          base_prompt?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          success_rate?: number | null
          target_models?: string[] | null
          updated_at?: string
          user_id?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "jailbreak_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_scan_results: {
        Row: {
          batch_id: string | null
          category: Database["public"]["Enums"]["attack_category"]
          created_at: string
          error: string | null
          id: string
          is_vulnerable: boolean | null
          metadata: Json | null
          model: string
          model_response: string | null
          prompt: string
          provider: string
          raw_response: Json | null
          scan_id: string | null
          severity: Database["public"]["Enums"]["scan_severity"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          category: Database["public"]["Enums"]["attack_category"]
          created_at?: string
          error?: string | null
          id?: string
          is_vulnerable?: boolean | null
          metadata?: Json | null
          model: string
          model_response?: string | null
          prompt: string
          provider: string
          raw_response?: Json | null
          scan_id?: string | null
          severity?: Database["public"]["Enums"]["scan_severity"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_id?: string | null
          category?: Database["public"]["Enums"]["attack_category"]
          created_at?: string
          error?: string | null
          id?: string
          is_vulnerable?: boolean | null
          metadata?: Json | null
          model?: string
          model_response?: string | null
          prompt?: string
          provider?: string
          raw_response?: Json | null
          scan_id?: string | null
          severity?: Database["public"]["Enums"]["scan_severity"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "llm_scan_results_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "llm_scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "llm_scan_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_scans: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_recurring: boolean | null
          is_vulnerable: boolean | null
          label: string | null
          name: string
          next_run: string | null
          results: Json | null
          scan_type: string | null
          schedule: string | null
          severity: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_recurring?: boolean | null
          is_vulnerable?: boolean | null
          label?: string | null
          name: string
          next_run?: string | null
          results?: Json | null
          scan_type?: string | null
          schedule?: string | null
          severity?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_recurring?: boolean | null
          is_vulnerable?: boolean | null
          label?: string | null
          name?: string
          next_run?: string | null
          results?: Json | null
          scan_type?: string | null
          schedule?: string | null
          severity?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "llm_scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      model_security_tests: {
        Row: {
          category: Database["public"]["Enums"]["attack_category"]
          created_at: string
          description: string | null
          expected_results: Json | null
          id: string
          is_public: boolean | null
          name: string
          test_prompts: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["attack_category"]
          created_at?: string
          description?: string | null
          expected_results?: Json | null
          id?: string
          is_public?: boolean | null
          name: string
          test_prompts: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["attack_category"]
          created_at?: string
          description?: string | null
          expected_results?: Json | null
          id?: string
          is_public?: boolean | null
          name?: string
          test_prompts?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_security_tests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          api_keys: Json | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          api_keys?: Json | null
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          api_keys?: Json | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompt_fuzzing_scans: {
        Row: {
          base_prompt: string
          created_at: string
          fuzzing_type: string
          id: string
          mutations: Json | null
          name: string
          results: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_prompt: string
          created_at?: string
          fuzzing_type: string
          id?: string
          mutations?: Json | null
          name: string
          results?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_prompt?: string
          created_at?: string
          fuzzing_type?: string
          id?: string
          mutations?: Json | null
          name?: string
          results?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_fuzzing_scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          augmented_text: string | null
          created_at: string
          id: string
          keyword: string | null
          original_text: string
          provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          augmented_text?: string | null
          created_at?: string
          id?: string
          keyword?: string | null
          original_text: string
          provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          augmented_text?: string | null
          created_at?: string
          id?: string
          keyword?: string | null
          original_text?: string
          provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_llm_scans: {
        Row: {
          created_at: string
          custom_endpoint: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          last_run: string | null
          model: string
          name: string
          next_run: string | null
          prompts: Json
          provider: string
          schedule: string
          schedule_day: number | null
          schedule_hour: number | null
          schedule_minute: number | null
          schedule_month: number | null
          schedule_weekday: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_endpoint?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          model: string
          name: string
          next_run?: string | null
          prompts: Json
          provider: string
          schedule: string
          schedule_day?: number | null
          schedule_hour?: number | null
          schedule_minute?: number | null
          schedule_month?: number | null
          schedule_weekday?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_endpoint?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run?: string | null
          model?: string
          name?: string
          next_run?: string | null
          prompts?: Json
          provider?: string
          schedule?: string
          schedule_day?: number | null
          schedule_hour?: number | null
          schedule_minute?: number | null
          schedule_month?: number | null
          schedule_weekday?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_llm_scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      process_scheduled_scans: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_database: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      attack_category:
        | "jailbreaking"
        | "prompt-injection"
        | "encoding-based"
        | "unsafe-prompts"
        | "uncensored-prompts"
        | "language-based-adversarial"
        | "glitch-tokens"
        | "llm-evasion"
        | "system-prompt-leaking"
        | "insecure-output"
      garak_test_suite:
        | "encoding"
        | "injection"
        | "xss"
        | "prompt_leaking"
        | "system_prompt"
        | "data_extraction"
      scan_severity: "low" | "medium" | "high" | "critical"
      scan_status: "pending" | "processing" | "completed" | "failed"
      scan_test_category:
        | "prompt_injection"
        | "data_leakage"
        | "model_behavior"
        | "safety_bounds"
        | "system_prompt"
        | "performance"
      test_category:
        | "prompt_injection"
        | "data_leakage"
        | "model_behavior"
        | "safety_bounds"
        | "system_prompt"
        | "performance"
      vulnerability_detection_mode: "default" | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
