import { Json } from '../common';

export interface GeraideScanTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    provider: string;
    model: string;
    dataset_id: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    results: Json | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    provider: string;
    model?: string;
    dataset_id?: string | null;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    results?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    provider?: string;
    model?: string;
    dataset_id?: string | null;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    results?: Json | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "geraide_scans_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "geraide_scans_dataset_id_fkey";
      columns: ["dataset_id"];
      isOneToOne: false;
      referencedRelation: "datasets";
      referencedColumns: ["id"];
    }
  ];
}