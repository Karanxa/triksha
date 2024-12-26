import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Default to empty strings to prevent runtime errors, but we'll validate before creating client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://irdlyshhtwzqjvymilww.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZGx5c2hodHd6cWp2eW1pbHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5NTM2MDAsImV4cCI6MjAyNDUyOTYwMH0.GE-I6enxByHjkEZ3alqrdD0m1ZgBm5CXOLdCaHLqeJE';

// Validate Supabase URL format
const isValidSupabaseUrl = (url: string) => {
  if (!url) {
    return false;
  }
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
};

// Validate Supabase URL format
if (!isValidSupabaseUrl(supabaseUrl)) {
  const error = 'Invalid Supabase URL format. URL must end with .supabase.co';
  console.error(error);
  toast.error(error);
  throw new Error(error);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Track project changes
const projectRef = supabaseUrl.match(/\/\/([^.]+)\./)?.[1];
if (projectRef) {
  // Store the project ref in localStorage to track which project the user is connected to
  const storedProjectRef = localStorage.getItem('supabase_project_ref');
  
  if (storedProjectRef && storedProjectRef !== projectRef) {
    const warning = 'Warning: You are connecting to a different Supabase project than previously used. This may affect your data visibility.';
    console.warn(warning);
    toast.warning(warning);
  }
  
  localStorage.setItem('supabase_project_ref', projectRef);
}