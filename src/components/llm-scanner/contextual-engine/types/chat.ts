export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentQuestionIndex: number;
  fingerprintResults: FingerPrintResult | null;
}

export interface ChatProps {
  config: {
    provider: string;
    model: string;
    datasetId: string;
    customEndpoint?: {
      url: string;
      apiKey: string;
      headers: string;
      method: string;
    };
  } | null;
  onComplete: (results: FingerPrintResult) => void;
  onProgress?: (progress: number) => void;
  isPaused?: boolean;
}

export interface FingerPrintResult {
  capabilities: string;
  boundaries: string;
  training: string;
  languages: string;
  safety: string;
}

export interface UseContextualScanReturn {
  messages: Message[];
  isLoading: boolean;
  currentStep: number;
  scanComplete: boolean;
  processNextQuestion: (provider: string, model: string, customEndpoint?: any) => Promise<boolean>;
  startDatasetAnalysis: (datasetId: string, fingerprint: any, provider: string, model: string, customEndpoint?: any) => Promise<void>;
  reset: () => void;
  totalQuestions: number;
  canProcessNext: boolean;
}