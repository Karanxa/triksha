import { Message, FingerPrintResult } from '../types';

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
  } | null;
  onComplete: (results: FingerPrintResult) => void;
  onProgress?: (progress: number) => void;
}