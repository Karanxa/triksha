import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import { handleOpenAIRequest } from "./providers/openai.ts";
import { processCustomEndpoint } from "./providers/customEndpoint.ts";
import { updateScanStatus } from "./db.ts";
import { analyzeVulnerability } from "./utils.ts";
import { corsHeaders } from "./cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompts, provider, category, customEndpoint } = await req.json();
    
    if (!scanId || !prompts || !provider) {
      throw new Error('Missing required parameters');
    }

    // Update scan status to processing
    await updateScanStatus(scanId, 'processing');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's API keys
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw userError || new Error('User not found');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    let response: string;
    const baseProvider = provider.split('-')[0];

    console.log(`Processing scan with provider: ${baseProvider}`);

    // Handle different providers
    if (baseProvider === 'custom' && customEndpoint) {
      response = await processCustomEndpoint(customEndpoint, prompts[0]);
    } else if (baseProvider === 'ollama') {
      response = await handleOllamaRequest(prompts[0], provider.split('-')[1]);
    } else if (baseProvider === 'openai') {
      const apiKey = profile?.api_keys?.openai;
      response = await handleOpenAIRequest(prompts[0], apiKey);
    } else {
      throw new Error(`Provider ${baseProvider} not implemented or invalid`);
    }

    // Create scan results
    const scanResults = {
      prompt: prompts[0],
      model_response: response,
      category,
      is_vulnerable: analyzeVulnerability(category, response)
    };

    // Update scan with results
    await updateScanStatus(scanId, 'completed', scanResults);

    return new Response(
      JSON.stringify(scanResults),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in scan-llm function:', error);
    
    try {
      const { scanId } = await req.json();
      if (scanId) {
        await updateScanStatus(scanId, 'failed', {
          prompt: '',
          model_response: '',
          error: error.message
        });
      }
    } catch {
      // Ignore error if we can't parse the request body
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});