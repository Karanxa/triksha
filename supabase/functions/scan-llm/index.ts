import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCustomEndpoint } from "./customEndpoint.ts";
import { handleOpenAIRequest } from "./providers/openai.ts";
import { handleAnthropicRequest } from "./providers/anthropic.ts";
import { handleGeminiRequest } from "./providers/gemini.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import { processResponse } from "./utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const results = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      try {
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

        const modelResponse = processResponse(response);
        
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
            category,
          })
          .select()
          .single();

        if (resultError) throw resultError;
        results.push(resultData);

        // Update progress
        const progress = Math.round(((i + 1) / prompts.length) * 100);
        await supabase
          .from('llm_scans')
          .update({ 
            results: { 
              prompts,
              progress,
              responses: results
            }
          })
          .eq('id', scanId);

        // Add delay between requests to respect rate limits
        if (i < prompts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 / qps));
        }
      } catch (error) {
        console.error(`Error processing prompt "${prompt}":`, error);
        results.push({
          prompt,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          provider: baseProvider,
          model,
          timestamp: new Date().toISOString(),
        });
      }
    }

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