import { CustomEndpoint } from '@/components/llm-scanner/types/CustomEndpoint';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderModel {
  value: string;
  label: string;
}

export interface DatasetOption {
  id: string;
  name: string;
  description: string | null;
}

export type Phase = 'not_started' | 'fingerprinting' | 'dataset_analysis' | 'completed';

export interface FingerPrintPhaseProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
  };
  onComplete: (results: FingerPrintResult) => void;
  onProgress: (progress: number) => void;
  isPaused: boolean;
  scanId: string | null;
}

export interface DatasetAnalysisProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
    customEndpoint?: CustomEndpoint;
  };
  fingerprint: FingerPrintResult;
  isPaused?: boolean;
  scanId: string | null;
  onComplete?: (results: any) => void;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentQuestionIndex: number;
  fingerprintResults: FingerPrintResult | null;
}

// Make FingerPrintResult compatible with Json type
export interface FingerPrintResult {
  [key: string]: string | null | undefined;
  capabilities: string;
  boundaries: string;
  training: string;
  languages: string;
  safety: string;
}