import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCustomEndpoint } from "./customEndpoint.ts";
import { handleOpenAIRequest } from "./providers/openai.ts";
import { handleAnthropicRequest } from "./providers/anthropic.ts";
import { handleGeminiRequest } from "./providers/gemini.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import { processCustomEndpointResponse } from "./responseProcessor.ts";
import { processBatchWithProgress } from "./batchProcessor.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const CHUNK_SIZE = 1000; // Process results in chunks of 1000

async function processBatch(prompts: string[], provider: string, userId: string, qps: number, customEndpoint?: any, scanId?: string) {
  console.log('Processing batch:', { promptCount: prompts.length, provider, qps });
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('api_keys')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.api_keys) {
    console.error('Failed to fetch API keys:', profileError);
    throw new Error('Failed to fetch API keys');
  }

  const apiKeys = profile.api_keys;
  const batchSize = qps;
  
  // Extract provider and model
  const [baseProvider, model] = provider ? provider.split('-') : [null, null];
  
  // Create a function to process a single prompt
  const processPrompt = async (prompt: string) => {
    try {
      let response;
      console.log('Processing prompt:', prompt);

      if (customEndpoint) {
        response = await handleCustomEndpoint(prompt, customEndpoint);
        return {
          prompt,
          model_response: response.model_response,
          raw_response: response.raw_response,
          provider: 'custom',
          model: 'custom-endpoint',
          timestamp: new Date().toISOString(),
        };
      }

      switch (baseProvider) {
        case 'openai':
          if (!apiKeys.openai) throw new Error('OpenAI API key not configured');
          response = await handleOpenAIRequest(prompt, apiKeys.openai, model);
          break;
        case 'anthropic':
          if (!apiKeys.anthropic) throw new Error('Anthropic API key not configured');
          response = await handleAnthropicRequest(prompt, apiKeys.anthropic, model);
          break;
        case 'gemini':
          if (!apiKeys.gemini) throw new Error('Google API key not configured');
          response = await handleGeminiRequest(prompt, apiKeys.gemini, model);
          break;
        case 'ollama':
          if (!apiKeys.ollama_endpoint) throw new Error('Ollama endpoint not configured');
          response = await handleOllamaRequest(prompt, apiKeys.ollama_endpoint, model);
          break;
        default:
          throw new Error(`Unsupported provider: ${baseProvider}`);
      }

      const processedResponse = processCustomEndpointResponse(response);
      return {
        prompt,
        model_response: processedResponse,
        raw_response: response,
        provider: baseProvider,
        model,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error processing prompt "${prompt}":`, error);
      return {
        prompt,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        provider: baseProvider,
        model,
        timestamp: new Date().toISOString(),
      };
    }
  };

  return await processBatchWithProgress(prompts, batchSize, processPrompt, {
    scanId: scanId!,
    supabase
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
        results: { progress: 0 }
      })
      .eq('id', scanId);

    // Process prompts and store results
    const results = await processBatch(prompts, provider, user.id, qps, customEndpoint, scanId);
    console.log('Processing completed, updating final status...');

    // Update final status
    await supabase
      .from('llm_scans')
      .update({ 
        status: 'completed',
        results: { progress: 100, data: results }
      })
      .eq('id', scanId);

    console.log('Scan completed successfully');
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scan error:', error);

    // Update scan status to failed
    if (error instanceof Error) {
      try {
        const { scanId } = await req.json();
        await supabase
          .from('llm_scans')
          .update({ 
            status: 'failed',
            results: { error: error.message }
          })
          .eq('id', scanId);
      } catch (updateError) {
        console.error('Error updating scan status:', updateError);
      }
    }

    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      results: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
