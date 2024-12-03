import { ApiKeys } from "@/integrations/supabase/types/common";

export interface DatasetChatProps {
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
  };
  fingerprint: any;
  isPaused: boolean;
  isStopped: boolean;
  onProgress: (progress: number) => void;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}