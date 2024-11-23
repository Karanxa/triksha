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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      model_fingerprint_role: 'system' | 'user' | 'assistant';
    };
    CompositeTypes: Record<string, never>;
  };
}