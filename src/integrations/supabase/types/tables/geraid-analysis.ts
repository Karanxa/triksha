export interface GeraidAnalysisTable {
  Row: {
    id: string;
    user_id: string;
    provider: string;
    model: string;
    question: string;
    response: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    provider: string;
    model: string;
    question: string;
    response: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    provider?: string;
    model?: string;
    question?: string;
    response?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "geraid_analysis_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    }
  ];
}