export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentQuestionIndex: number;
  fingerprintResults: FingerPrintResult | null;
  scanId: string | null;
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
  onProgress: (questionIndex: number) => void;
  isPaused?: boolean;
  isStopped?: boolean;
  scanId: string | null;
  onScanIdUpdate: (id: string) => void;
}

export interface FingerPrintResult {
  capabilities: string;
  boundaries: string;
  training: string;
  languages: string;
  safety: string;
}