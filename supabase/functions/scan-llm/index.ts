import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCustomEndpoint } from "./customEndpoint.ts";
import { handleOpenAIRequest } from "./providers/openai.ts";
import { handleAnthropicRequest } from "./providers/anthropic.ts";
import { handleGeminiRequest } from "./providers/gemini.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
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
        results: { progress: 0 },
        scan_type: prompts.length > 1 ? 'batch_scan' : 'manual_scan'
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
    console.log('Using provider:', baseProvider, 'with model:', model);

    // Process prompts in batches
    const batchSize = Math.min(qps, 10); // Limit batch size
    const results = await processBatchWithProgress(prompts, batchSize, async (prompt) => {
      try {
        console.log('Processing prompt:', prompt);
        let response;
        if (customEndpoint) {
          response = await handleCustomEndpoint(prompt, customEndpoint);
        } else {
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
        }

        console.log('Provider response:', response);

        // Extract the text response based on provider
        let modelResponse = '';
        if (response.choices?.[0]?.message?.content) {
          // OpenAI format
          modelResponse = response.choices[0].message.content;
        } else if (response.content?.[0]?.text) {
          // Gemini format
          modelResponse = response.content[0].text;
        } else if (response.response) {
          // Ollama format
          modelResponse = response.response;
        } else if (response.message?.content) {
          // Anthropic format
          modelResponse = response.message.content;
        } else {
          modelResponse = JSON.stringify(response);
        }

        // Store individual result
        const { data: resultData, error: resultError } = await supabase
          .from('llm_scan_results')
          .insert({
            scan_id: scanId,
            user_id: user.id,
            prompt,
            model_response: modelResponse,
            raw_response: response,
            provider: baseProvider || 'custom',
            model: model || 'custom-endpoint',
            category
          })
          .select()
          .single();

        if (resultError) throw resultError;

        // Return formatted result
        return {
          prompt,
          model_response: modelResponse,
          raw_response: response
        };
      } catch (error) {
        console.error(`Error processing prompt: ${prompt}`, error);
        // Store error result
        const { data: errorResult } = await supabase
          .from('llm_scan_results')
          .insert({
            scan_id: scanId,
            user_id: user.id,
            prompt,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            provider: baseProvider || 'custom',
            model: model || 'custom-endpoint',
            category
          })
          .select()
          .single();
        
        return {
          prompt,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }, {
      scanId,
      supabase,
      user,
      baseProvider,
      model,
      category
    });

    // Update final status with properly formatted results
    await supabase
      .from('llm_scans')
      .update({ 
        status: 'completed',
        results: { 
          progress: 100,
          responses: results.map(r => ({
            prompt: r.prompt,
            model_response: r.model_response,
            raw_response: r.raw_response,
            error: r.error
          }))
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
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});