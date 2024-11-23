import { Json } from '../common';

export interface ModelFingerprintSession {
  id: string;
  user_id: string;
  dataset_id: string;
  provider: string;
  model: string;
  status: string;
  results: Json | null;
  created_at: string;
  updated_at: string;
}

export interface ModelFingerprintMessage {
  id: string;
  session_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}

export interface ModelFingerprintSessionsTable {
  Row: ModelFingerprintSession;
  Insert: Omit<ModelFingerprintSession, 'id' | 'created_at' | 'updated_at' | 'results'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
    results?: Json | null;
  };
  Update: Partial<Omit<ModelFingerprintSession, 'id'>>;
  Relationships: [
    {
      foreignKeyName: "model_fingerprint_sessions_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "model_fingerprint_sessions_dataset_id_fkey";
      columns: ["dataset_id"];
      isOneToOne: false;
      referencedRelation: "datasets";
      referencedColumns: ["id"];
    }
  ];
}

export interface ModelFingerprintMessagesTable {
  Row: ModelFingerprintMessage;
  Insert: Omit<ModelFingerprintMessage, 'id' | 'created_at' | 'updated_at'> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<Omit<ModelFingerprintMessage, 'id'>>;
  Relationships: [
    {
      foreignKeyName: "model_fingerprint_messages_session_id_fkey";
      columns: ["session_id"];
      isOneToOne: false;
      referencedRelation: "model_fingerprint_sessions";
      referencedColumns: ["id"];
    }
  ];
}