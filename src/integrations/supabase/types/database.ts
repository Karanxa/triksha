import { DatasetsTable } from './tables/datasets';
import { FineTuningJobsTable } from './tables/fine-tuning-jobs';
import { LLMScansTable } from './tables/llm-scans';
import { ProfilesTable } from './tables/profiles';
import { PromptsTable } from './tables/prompts';
import { GeraideScanTable } from './tables/geraide-scans';
import { GeraidAnalysisTable } from './tables/geraid-analysis';

export interface Database {
  public: {
    Tables: {
      datasets: DatasetsTable;
      fine_tuning_jobs: FineTuningJobsTable;
      llm_scans: LLMScansTable;
      profiles: ProfilesTable;
      prompts: PromptsTable;
      geraide_scans: GeraideScanTable;
      geraid_analysis: GeraidAnalysisTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}