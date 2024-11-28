import { Message } from '../types';

export interface ScanState {
  messages: Message[];
  isLoading: boolean;
  currentStep: number;
  scanComplete: boolean;
  scanId: string | null;
}

export interface GeraideScanResult {
  messages: {
    role: string;
    content: string;
  }[];
  provider: string;
  model: string;
  user_id: string;
}