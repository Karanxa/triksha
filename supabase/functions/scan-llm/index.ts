import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCustomEndpoint } from "./customEndpoint.ts";
import { handleOpenAIRequest } from "./providers/openai.ts";
import { handleAnthropicRequest } from "./providers/anthropic.ts";
import { handleGeminiRequest } from "./providers/gemini.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import { processResponse } from "./utils.ts";
import { processBatchWithProgress } from "./batchProcessor.ts";

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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { scanId, prompts, provider, category, customEndpoint, qps = 5 } = await req.json();
    console.log('Received scan request:', { scanId, promptCount: prompts?.length, provider, category });

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      throw new Error('Invalid prompts array');
    }

    if (!provider && !customEndpoint) {
      throw new Error('Provider or custom endpoint configuration is required');
    }

    // Update scan status to processing
    await supabase
      .from('llm_scans')
      .update({ 
        status: 'processing',
        results: { prompts, progress: 0 }
      })
      .eq('id', scanId);

    const { data: profile } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (!profile?.api_keys) {
      throw new Error('API keys not configured');
    }

    const apiKeys = profile.api_keys;
    const [baseProvider, model] = provider ? provider.split('-') : [null, null];

    // Process single prompt vs batch
    const processPrompt = async (prompt: string) => {
      if (customEndpoint) {
        return await handleCustomEndpoint(prompt, customEndpoint);
      }

      switch (baseProvider) {
        case 'openai':
          if (!apiKeys.openai) throw new Error('OpenAI API key not configured');
          return await handleOpenAIRequest(prompt, apiKeys.openai, model);
        case 'anthropic':
          if (!apiKeys.anthropic) throw new Error('Anthropic API key not configured');
          return await handleAnthropicRequest(prompt, apiKeys.anthropic, model);
        case 'gemini':
          if (!apiKeys.gemini) throw new Error('Google API key not configured');
          return await handleGeminiRequest(prompt, apiKeys.gemini, model);
        case 'ollama':
          if (!apiKeys.ollama_endpoint) throw new Error('Ollama endpoint not configured');
          return await handleOllamaRequest(prompt, apiKeys.ollama_endpoint, model);
        default:
          throw new Error(`Unsupported provider: ${baseProvider}`);
      }
    };

    // Use batch processor for multiple prompts
    const batchSize = 5; // Process 5 prompts at a time
    const results = await processBatchWithProgress(prompts, batchSize, processPrompt, {
      scanId,
      supabase,
      user,
      baseProvider,
      model,
      category
    });

    // Update final status
    await supabase
      .from('llm_scans')
      .update({ 
        status: 'completed',
        results: { 
          prompts,
          progress: 100,
          responses: results
        }
      })
      .eq('id', scanId);

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Scan error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        results: null 
      }), {
        status: 200, // Return 200 even for errors to avoid Edge Function errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});