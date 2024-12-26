import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Validate Supabase URL format
const isValidSupabaseUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
};

// Check if environment variables are properly set
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  const error = 'Supabase configuration missing. Please set up your project URL and anon key.';
  console.error(error);
  toast.error(error);
  throw new Error(error);
}

// Validate Supabase URL format
if (!isValidSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)) {
  const error = 'Invalid Supabase URL format. URL must end with .supabase.co';
  console.error(error);
  toast.error(error);
  throw new Error(error);
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Add a warning if using any project URL that's not the user's own
const projectRef = import.meta.env.VITE_SUPABASE_URL.match(/\/\/([^.]+)\./)?.[1];
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