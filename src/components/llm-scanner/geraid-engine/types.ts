import { FingerPrintResult } from './types';
import { CustomEndpoint } from '../../types/CustomEndpoint';

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

// Make FingerPrintResult compatible with Json type
export interface FingerPrintResult {
  [key: string]: string | null | undefined;
  capabilities?: string;
  boundaries?: string;
  training?: string;
  languages?: string;
  safety?: string;
}
