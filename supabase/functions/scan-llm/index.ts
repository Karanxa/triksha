import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { handleOpenAIRequest } from './providers/openai.ts';
import { handleAnthropicRequest } from './providers/anthropic.ts';
import { handleGeminiRequest } from './providers/gemini.ts';
import { handleOllamaRequest } from './providers/ollama.ts';
import { handleCustomEndpoint } from './customEndpoint.ts';
import { processCustomEndpointResponse } from './responseProcessor.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function processBatch(prompts: string[], provider: string, userId: string, qps: number, customEndpoint?: any) {
  console.log('Processing batch:', { prompts, provider, customEndpoint });
  
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
  const results = [];
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchPromises = batch.map(async (prompt) => {
      try {
        let response;
        console.log('Processing prompt:', prompt);

        if (customEndpoint) {
          console.log('Using custom endpoint:', customEndpoint);
          response = await handleCustomEndpoint(prompt, customEndpoint);
          console.log('Custom endpoint response:', response);
          
          // Ensure we have a valid response structure
          if (response.error) {
            return {
              prompt,
              error: response.error,
              timestamp: new Date().toISOString(),
            };
          }
          
          return {
            prompt,
            model_response: response.model_response,
            raw_response: response.raw_response,
            timestamp: new Date().toISOString(),
          };
        }

        // Handle regular providers
        const [baseProvider, model] = provider.split('-');
        switch (baseProvider) {
          case 'openai':
            if (!apiKeys.openai) throw new Error('OpenAI API key not configured');
            response = await handleOpenAIRequest(prompt, apiKeys.openai, model);
            break;
          case 'anthropic':
            if (!apiKeys.anthropic) throw new Error('Anthropic API key not configured');
            response = await handleAnthropicRequest(prompt, apiKeys.anthropic);
            break;
          case 'gemini':
            if (!apiKeys.gemini) throw new Error('Google API key not configured');
            response = await handleGeminiRequest(prompt, apiKeys.gemini);
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
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error processing prompt "${prompt}":`, error);
        return {
          prompt,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString(),
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (i + batchSize < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

Deno.serve(async (req) => {
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
    console.log('Received scan request:', { scanId, prompts, provider, category, customEndpoint });

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      throw new Error('Invalid prompts array');
    }

    if (!provider && !customEndpoint) {
      throw new Error('Provider or custom endpoint configuration is required');
    }

    // Process prompts and store results
    const results = await processBatch(prompts, provider, user.id, qps, customEndpoint);
    console.log('Processed results:', results);

    // Update scan with results
    const { error: updateError } = await supabase
      .from('llm_scans')
      .update({
        results: {
          prompts,
          responses: results,
          timestamp: new Date().toISOString(),
        },
        status: 'completed',
      })
      .eq('id', scanId);

    if (updateError) {
      console.error('Failed to update scan results:', updateError);
      throw new Error('Failed to update scan results');
    }

    console.log('Scan completed successfully');
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scan error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      results: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});