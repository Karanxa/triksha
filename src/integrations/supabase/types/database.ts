import { DatasetsTable } from './tables/datasets';
import { FineTuningJobsTable } from './tables/fine-tuning-jobs';
import { LLMScansTable } from './tables/llm-scans';
import { ProfilesTable } from './tables/profiles';
import { PromptsTable } from './tables/prompts';
import { ModelFingerprintSessionsTable, ModelFingerprintMessagesTable } from './tables/model-fingerprint';

export interface Database {
  public: {
    Tables: {
      datasets: DatasetsTable;
      fine_tuning_jobs: FineTuningJobsTable;
      llm_scans: LLMScansTable;
      profiles: ProfilesTable;
      prompts: PromptsTable;
      model_fingerprint_sessions: ModelFingerprintSessionsTable;
      model_fingerprint_messages: ModelFingerprintMessagesTable;
      custom_scan_executions: {
        Row: {
          created_at: string;
          id: string;
          model: string;
          name: string;
          results: Json | null;
          status: string;
          test_ids: string[];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          model: string;
          name: string;
          results?: Json | null;
          status?: string;
          test_ids: string[];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          model?: string;
          name?: string;
          results?: Json | null;
          status?: string;
          test_ids?: string[];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "custom_scan_executions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_scan_tests: {
        Row: {
          category: Database["public"]["Enums"]["scan_test_category"];
          created_at: string;
          description: string | null;
          expected_behavior: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          test_prompt: string;
          updated_at: string;
          user_id: string;
          validation_rules: Json | null;
        };
        Insert: {
          category: Database["public"]["Enums"]["scan_test_category"];
          created_at?: string;
          description?: string | null;
          expected_behavior?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          test_prompt: string;
          updated_at?: string;
          user_id: string;
          validation_rules?: Json | null;
        };
        Update: {
          category?: Database["public"]["Enums"]["scan_test_category"];
          created_at?: string;
          description?: string | null;
          expected_behavior?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          test_prompt?: string;
          updated_at?: string;
          user_id?: string;
          validation_rules?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "custom_scan_tests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "fine_tuning_jobs_dataset_id_fkey";
            columns: ["dataset_id"];
            isOneToOne: false;
            referencedRelation: "datasets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fine_tuning_jobs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      garak_scans: {
        Row: {
          config: Json | null;
          created_at: string;
          id: string;
          model: string;
          name: string;
          prompts: Json;
          results: Json | null;
          status: string;
          test_suites: string[];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          config?: Json | null;
          created_at?: string;
          id?: string;
          model: string;
          name: string;
          prompts: Json;
          results?: Json | null;
          status?: string;
          test_suites: string[];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          config?: Json | null;
          created_at?: string;
          id?: string;
          model?: string;
          name?: string;
          prompts?: Json;
          results?: Json | null;
          status?: string;
          test_suites?: string[];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "garak_scans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      integration_settings: {
        Row: {
          created_at: string;
          id: string;
          provider: string;
          settings: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          provider: string;
          settings?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          provider?: string;
          settings?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      jailbreak_templates: {
        Row: {
          base_prompt: string;
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          is_public: boolean | null;
          name: string;
          success_rate: number | null;
          target_models: string[] | null;
          updated_at: string;
          user_id: string;
          variables: Json | null;
        };
        Insert: {
          base_prompt: string;
          category: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          name: string;
          success_rate?: number | null;
          target_models?: string[] | null;
          updated_at?: string;
          user_id: string;
          variables?: Json | null;
        };
        Update: {
          base_prompt?: string;
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean | null;
          name?: string;
          success_rate?: number | null;
          target_models?: string[] | null;
          updated_at?: string;
          user_id?: string;
          variables?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "jailbreak_templates_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      llm_scan_results: {
        Row: {
          batch_id: string | null;
          category: Database["public"]["Enums"]["attack_category"];
          created_at: string;
          error: string | null;
          id: string;
          is_vulnerable: boolean | null;
          metadata: Json | null;
          model: string;
          model_response: string | null;
          prompt: string;
          provider: string;
          raw_response: Json | null;
          scan_id: string | null;
          severity: Database["public"]["Enums"]["scan_severity"] | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          batch_id?: string | null;
          category: Database["public"]["Enums"]["attack_category"];
          created_at?: string;
          error?: string | null;
          id?: string;
          is_vulnerable?: boolean | null;
          metadata?: Json | null;
          model: string;
          model_response?: string | null;
          prompt: string;
          provider: string;
          raw_response?: Json | null;
          scan_id?: string | null;
          severity?: Database["public"]["Enums"]["scan_severity"] | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          batch_id?: string | null;
          category?: Database["public"]["Enums"]["attack_category"];
          created_at?: string;
          error?: string | null;
          id?: string;
          is_vulnerable?: boolean | null;
          metadata?: Json | null;
          model?: string;
          model_response?: string | null;
          prompt?: string;
          provider?: string;
          raw_response?: string | null;
          scan_id?: string | null;
          severity?: Database["public"]["Enums"]["scan_severity"] | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "llm_scan_results_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "llm_scans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "llm_scan_results_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
          scan_type: string | null;
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
          scan_type?: string | null;
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
          scan_type?: string | null;
          schedule?: string | null;
          severity?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "llm_scans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      model_security_tests: {
        Row: {
          category: Database["public"]["Enums"]["attack_category"];
          created_at: string;
          description: string | null;
          expected_results: Json | null;
          id: string;
          is_public: boolean | null;
          name: string;
          test_prompts: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category: Database["public"]["Enums"]["attack_category"];
          created_at?: string;
          description?: string | null;
          expected_results?: Json | null;
          id?: string;
          is_public?: boolean | null;
          name: string;
          test_prompts: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["attack_category"];
          created_at?: string;
          description?: string | null;
          expected_results?: Json | null;
          id?: string;
          is_public?: boolean | null;
          name?: string;
          test_prompts?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "model_security_tests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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
          id: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scheduled_llm_scans: {
        Row: {
          created_at: string;
          custom_endpoint: Json | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          last_run: string | null;
          model: string;
          name: string;
          next_run: string | null;
          prompts: Json;
          provider: string;
          schedule: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          custom_endpoint?: Json | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_run?: string | null;
          model: string;
          name: string;
          next_run?: string | null;
          prompts: Json;
          provider: string;
          schedule: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          custom_endpoint?: Json | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_run?: string | null;
          model?: string;
          name?: string;
          next_run?: string | null;
          prompts?: Json;
          provider?: string;
          schedule?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scheduled_llm_scans_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      model_fingerprint_role: 'system' | 'user' | 'assistant';
      attack_category: "jailbreaking" | "prompt-injection" | "encoding-based" | "unsafe-prompts" | "uncensored-prompts" | "language-based-adversarial" | "glitch-tokens" | "llm-evasion" | "system-prompt-leaking" | "insecure-output";
      scan_severity: "low" | "medium" | "high" | "critical";
      scan_status: "pending" | "processing" | "completed" | "failed";
      scan_test_category: "prompt_injection" | "data_leakage" | "model_behavior" | "safety_bounds" | "system_prompt" | "performance";
      test_category: "prompt_injection" | "data_leakage" | "model_behavior" | "safety_bounds" | "system_prompt" | "performance";
    };
    CompositeTypes: Record<string, never>;
  };
}
