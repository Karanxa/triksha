export interface GarakScansTable {
  Row: {
    id: string;
    user_id: string;
    name: string;
    model: string;
    prompts: any;
    test_suites: string[];
    results: any | null;
    status: string;
    config: any | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    name: string;
    model: string;
    prompts: any;
    test_suites: string[];
    results?: any | null;
    status?: string;
    config?: any | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    name?: string;
    model?: string;
    prompts?: any;
    test_suites?: string[];
    results?: any | null;
    status?: string;
    config?: any | null;
    created_at?: string;
    updated_at?: string;
  };
}