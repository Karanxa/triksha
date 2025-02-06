import { supabase } from "@/integrations/supabase/client";

export const checkSupabaseSetup = async () => {
  try {
    // Check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (healthError) {
      console.error('Supabase connection error:', healthError);
      return false;
    }

    // Check if essential tables exist
    const requiredTables = [
      'profiles',
      'integration_settings',
      'contextual_scans',
      'llm_scans',
      'llm_scan_results'
    ] as const;

    for (const table of requiredTables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') { // Table doesn't exist
        console.error(`Missing required table: ${table}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking Supabase setup:', error);
    return false;
  }
};