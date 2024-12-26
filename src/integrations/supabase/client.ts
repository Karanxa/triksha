import { createClient } from '@supabase/supabase-js';

// Check if environment variables are properly set
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error(
    'Error: Supabase URL and Anon Key must be set in your .env file\n' +
    'Please create a .env file in your project root with:\n' +
    'VITE_SUPABASE_URL=your-project-url\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

// Add a warning if using default project URL
if (import.meta.env.VITE_SUPABASE_URL?.includes('irdlyshhtwzqjvymilww')) {
  console.warn(
    'Warning: You are using the default Supabase project URL.\n' +
    'To use your own Supabase project:\n' +
    '1. Create a new project at https://supabase.com\n' +
    '2. Copy your project URL and anon key from the project settings\n' +
    '3. Create a .env file in your project root\n' +
    '4. Add your project URL and anon key to the .env file:\n' +
    'VITE_SUPABASE_URL=your-project-url\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}