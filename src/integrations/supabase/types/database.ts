import { DatasetsTable } from './tables/datasets';
import { FineTuningJobsTable } from './tables/fine-tuning-jobs';
import { LLMScansTable } from './tables/llm-scans';
import { ProfilesTable } from './tables/profiles';
import { PromptsTable } from './tables/prompts';
import { GeraideScanTable } from './tables/geraide-scans';
import { CustomScanExecutionsTable } from './tables/custom-scan-executions';
import { CustomScanTestsTable } from './tables/custom-scan-tests';
import { GarakScansTable } from './tables/garak-scans';
import { IntegrationSettingsTable } from './tables/integration-settings';
import { JailbreakTemplatesTable } from './tables/jailbreak-templates';
import { LLMScanResultsTable } from './tables/llm-scan-results';
import { ModelSecurityTestsTable } from './tables/model-security-tests';
import { PromptFuzzingScansTable } from './tables/prompt-fuzzing-scans';
import { ScheduledLLMScansTable } from './tables/scheduled-llm-scans';

export interface Database {
  public: {
    Tables: {
      datasets: DatasetsTable;
      fine_tuning_jobs: FineTuningJobsTable;
      llm_scans: LLMScansTable;
      profiles: ProfilesTable;
      prompts: PromptsTable;
      geraide_scans: GeraideScanTable;
      custom_scan_executions: CustomScanExecutionsTable;
      custom_scan_tests: CustomScanTestsTable;
      garak_scans: GarakScansTable;
      integration_settings: IntegrationSettingsTable;
      jailbreak_templates: JailbreakTemplatesTable;
      llm_scan_results: LLMScanResultsTable;
      model_security_tests: ModelSecurityTestsTable;
      prompt_fuzzing_scans: PromptFuzzingScansTable;
      scheduled_llm_scans: ScheduledLLMScansTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}