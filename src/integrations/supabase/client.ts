import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Get environment variables
const supabaseUrl = 'https://irdlyshhtwzqjvymilww.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZGx5c2hodHd6cWp2eW1pbHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc0OTg3NzAsImV4cCI6MjAyMzA3NDc3MH0.GqwsXBZ5IvvW-Dc4JHhPl8rB8Wt8KQC8xGnkS0jghQY';

// Validate Supabase URL format
const isValidSupabaseUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
};

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Error: Supabase configuration missing. Please set up your project URL and anon key.'
  );
  toast.error('Supabase configuration missing. Please set up your project URL and anon key.');
  throw new Error('Supabase configuration missing. Please set up your project URL and anon key.');
}

// Validate URL format
if (!isValidSupabaseUrl(supabaseUrl)) {
  console.error('Error: Invalid Supabase URL format. URL must end with .supabase.co');
  toast.error('Invalid Supabase URL format');
  throw new Error('Invalid Supabase URL format. URL must end with .supabase.co');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`,
  },
});

// Track project changes
const projectRef = supabaseUrl.match(/(?:\/\/|\.)(.*?)\.supabase\.co/)?.[1];
const storedProjectRef = localStorage.getItem('supabase_project_ref');

if (storedProjectRef && storedProjectRef !== projectRef) {
  console.warn('Warning: Switching to a different Supabase project');
  toast.warning('Switching to a different Supabase project');
  localStorage.clear(); // Clear any stored data from previous project
}

localStorage.setItem('supabase_project_ref', projectRef || '');