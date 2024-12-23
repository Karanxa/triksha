import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  handleOpenAIRequest,
  handleAnthropicRequest,
  handleGoogleRequest,
  handleOllamaRequest,
  handleCustomRequest
} from "./handlers/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, model, prompt, customEndpoint } = await req.json();
    console.log('Fingerprinting request:', { provider, model, prompt, customEndpoint });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) throw new Error('Invalid user token');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError) throw new Error('Failed to fetch user profile');
    if (!profile?.api_keys) throw new Error('API keys not configured');

    let response;
    const normalizedProvider = provider.toLowerCase();
    
    switch (normalizedProvider) {
      case 'openai':
        const openaiKey = profile.api_keys.openai;
        if (!openaiKey) throw new Error('OpenAI API key not configured in Settings');
        response = await handleOpenAIRequest(prompt, model, openaiKey);
        break;
        
      case 'anthropic':
        const anthropicKey = profile.api_keys.anthropic;
        if (!anthropicKey) throw new Error('Anthropic API key not configured in Settings');
        response = await handleAnthropicRequest(prompt, model, anthropicKey);
        break;
        
      case 'google':
        const googleKey = profile.api_keys.gemini;
        if (!googleKey) throw new Error('Google API key not configured in Settings');
        response = await handleGoogleRequest(prompt, model, googleKey);
        break;
        
      case 'ollama':
        const ollamaEndpoint = profile.api_keys.ollama_endpoint;
        if (!ollamaEndpoint) throw new Error('Ollama endpoint not configured in Settings');
        response = await handleOllamaRequest(prompt, model, ollamaEndpoint);
        break;

      case 'custom':
        if (!customEndpoint) throw new Error('Custom endpoint configuration is required');
        response = await handleCustomRequest(prompt, customEndpoint);
        break;
        
      default:
        throw new Error(`Unsupported provider: ${provider}. Supported providers are: openai, anthropic, google, ollama, custom`);
    }

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in contextual-fingerprint function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});