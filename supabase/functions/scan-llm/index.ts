import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { processScan } from "./scanProcessor.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) throw new Error('Invalid user token');

    // Get request data
    const { scanId, prompts, provider, customEndpoint, category } = await req.json();
    console.log('Received scan request:', { 
      scanId, 
      promptCount: prompts?.length, 
      provider,
      isCustom: !!customEndpoint,
      category 
    });

    if (!prompts?.length) throw new Error('No prompts provided');
    if (!provider && !customEndpoint) throw new Error('Provider or custom endpoint required');

    // Update scan status to processing
    await supabase
      .from('llm_scans')
      .update({ 
        status: 'processing',
        results: { progress: 0 }
      })
      .eq('id', scanId);

    // For custom endpoints, we don't need API keys
    let apiKeys = null;
    if (provider !== 'custom') {
      // Get user's API keys
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('api_keys')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error(`Failed to get profile: ${profileError.message}`);
      if (!profile?.api_keys) throw new Error('API keys not configured');
      apiKeys = profile.api_keys;
    }

    // Process the scan with category
    const results = await processScan(
      scanId,
      prompts,
      provider,
      customEndpoint,
      apiKeys,
      supabase,
      user.id,
      category || 'jailbreaking' // Provide default category if none specified
    );

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Scan error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        results: null 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});