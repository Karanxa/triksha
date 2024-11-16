import { DatasetsTable } from './tables/datasets';
import { FineTuningJobsTable } from './tables/fine-tuning-jobs';
import { GarakScansTable } from './tables/garak-scans';
import { JailbreakTemplatesTable } from './tables/jailbreak-templates';
import { LLMScansTable } from './tables/llm-scans';
import { ProfilesTable } from './tables/profiles';
import { PromptsTable } from './tables/prompts';

export interface Database {
  public: {
    Tables: {
      datasets: DatasetsTable;
      fine_tuning_jobs: FineTuningJobsTable;
      garak_scans: GarakScansTable;
      jailbreak_templates: JailbreakTemplatesTable;
      llm_scans: LLMScansTable;
      profiles: ProfilesTable;
      prompts: PromptsTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type PublicSchema = Database['public'];