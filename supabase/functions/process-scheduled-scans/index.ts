import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all scans that are due to run
    const { data: dueScans, error: scansError } = await supabaseClient
      .from('llm_scans')
      .select('*')
      .eq('is_recurring', true)
      .lte('next_run', new Date().toISOString());

    if (scansError) {
      throw scansError;
    }

    const results = [];
    for (const scan of dueScans || []) {
      try {
        // Re-run the scan with the same parameters
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/scan-llm`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scanId: scan.id,
            prompts: [scan.results.prompt],
            provider: scan.provider,
            category: scan.category,
            schedule: scan.schedule,
            isRecurring: scan.is_recurring
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to re-run scan: ${await response.text()}`);
        }

        results.push({
          scanId: scan.id,
          status: 'success'
        });
      } catch (error) {
        console.error(`Error processing scheduled scan ${scan.id}:`, error);
        results.push({
          scanId: scan.id,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing scheduled scans:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});