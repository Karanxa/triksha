import { Message } from "../../geraid-engine/types";
import { FingerPrintResult } from "../types";

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
      curlCommand: string;
      placeholder: string;
    };
  } | null;
  onComplete: (results: FingerPrintResult) => void;
  onProgress?: (progress: number) => void;
  isPaused?: boolean;
}