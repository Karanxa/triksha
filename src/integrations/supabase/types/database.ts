import { DatasetsTable } from './tables/datasets';
import { FineTuningJobsTable } from './tables/fine-tuning-jobs';
import { LLMScansTable } from './tables/llm-scans';
import { ProfilesTable } from './tables/profiles';
import { PromptsTable } from './tables/prompts';
import { ModelFingerprintTables } from './tables/model-fingerprint';

export interface Database {
  public: {
    Tables: {
      datasets: DatasetsTable;
      fine_tuning_jobs: FineTuningJobsTable;
      llm_scans: LLMScansTable;
      profiles: ProfilesTable;
      prompts: PromptsTable;
      model_fingerprint_sessions: ModelFingerprintTables['model_fingerprint_sessions'];
      model_fingerprint_messages: ModelFingerprintTables['model_fingerprint_messages'];
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}