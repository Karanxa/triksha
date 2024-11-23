export interface ModelFingerprintSession {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  model: string;
  dataset_id: string | null;
  status: 'pending' | 'probing' | 'analyzing' | 'attacking' | 'completed' | 'failed';
  results: any;
  created_at: string;
  updated_at: string;
}

export interface ModelFingerprintMessage {
  id: string;
  session_id: string;
  role: 'assistant' | 'user' | 'system';
  content: string;
  metadata: any;
  created_at: string;
}

export interface ModelFingerprintTables {
  model_fingerprint_sessions: {
    Row: ModelFingerprintSession;
    Insert: Omit<ModelFingerprintSession, 'id' | 'created_at' | 'updated_at'>;
    Update: Partial<ModelFingerprintSession>;
  };
  model_fingerprint_messages: {
    Row: ModelFingerprintMessage;
    Insert: Omit<ModelFingerprintMessage, 'id' | 'created_at'>;
    Update: Partial<ModelFingerprintMessage>;
  };
}