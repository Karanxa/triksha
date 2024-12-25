export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  file_path: string | null;
  created_at: string;
  updated_at: string;
  category: string | null;
  metadata: {
    promptCount?: number;
    categories?: string[];
    format?: string;
  } | null;
}