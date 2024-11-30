import { Message } from '../types';

export interface ScanState {
  messages: Message[];
  isLoading: boolean;
  currentStep: number;
  scanComplete: boolean;
  scanId: string | null;
}

export interface FingerPrintResult {
  capabilities?: string;
  boundaries?: string;
  training?: string;
  languages?: string;
  safety?: string;
}