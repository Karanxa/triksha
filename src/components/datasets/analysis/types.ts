import { Message } from "@/components/llm-scanner/geraid-engine/types";
import { Json } from "@/integrations/supabase/types/common";

export interface AnalysisResult {
  originalPrompt: string;
  augmentedPrompt: string;
  modelResponse: string;
}

export interface DatasetAnalysisProps {
  config: {
    datasetId: string;
    provider: string;
    model: string;
  };
  fingerprint: any;
  isPaused: boolean;
  isStopped: boolean;
  lastPausedStep?: {
    phase: string;
    progress?: number;
  } | null;
}

export interface AnalysisState {
  messages: Message[];
  isLoading: boolean;
  originalPrompts: string[];
  analysisResults: AnalysisResult[] | null;
  phase: 'augmenting' | 'testing';
  progress: number;
}