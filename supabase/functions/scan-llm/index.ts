import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { handleOpenAIRequest } from './providers/openai.ts';
import { handleAnthropicRequest } from './providers/anthropic.ts';
import { handleGeminiRequest } from './providers/gemini.ts';
import { handleOllamaRequest } from './providers/ollama.ts';
import { processResponse } from './utils.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeVulnerability(prompt: string, response: string) {
  try {
    const analysisResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-vulnerability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, response }),
    });

    const data = await analysisResponse.json();
    return {
      analysis: data.analysis,
      isVulnerable: data.isVulnerable,
    };
  } catch (error) {
    console.error('Error analyzing vulnerability:', error);
    return {
      analysis: 'Error analyzing vulnerability',
      isVulnerable: null,
    };
  }
}

async function processBatch(prompts: string[], provider: string, userId: string, qps: number, customEndpoint?: any) {
  // First, fetch the API keys for this user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('api_keys')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.api_keys) {
    throw new Error('Failed to fetch API keys');
  }

  const apiKeys = profile.api_keys;
  const batchSize = qps;
  const results = [];
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchPromises = batch.map(async (prompt) => {
      try {
        let rawResponse;

        if (provider === 'custom') {
          if (customEndpoint.inputType === 'curl') {
            // Handle cURL command
            const curlCommand = customEndpoint.curlCommand.replace(
              customEndpoint.placeholder,
              encodeURIComponent(prompt)
            );
            // Convert cURL to fetch request and execute
            // This is a simplified version - you might want to add more curl parameter handling
            const url = curlCommand.match(/curl\s+'([^']+)'/)?.[1] || 
                       curlCommand.match(/curl\s+"([^"]+)"/)?.[1] ||
                       curlCommand.match(/curl\s+([^\s]+)/)?.[1];
            
            if (!url) throw new Error('Invalid cURL command');
            
            rawResponse = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ prompt }),
            });
          } else {
            // Handle manual endpoint configuration
            rawResponse = await fetch(customEndpoint.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${customEndpoint.apiKey}`,
                ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {}),
              },
              body: JSON.stringify({ prompt }),
            });
          }
        } else {
          // Handle regular providers
          const [baseProvider, model] = provider.split('-');
          switch (baseProvider) {
            case 'openai':
              if (!apiKeys.openai) throw new Error('OpenAI API key not configured');
              rawResponse = await handleOpenAIRequest(prompt, apiKeys.openai, model);
              break;
          case 'anthropic':
            if (!apiKeys.anthropic) throw new Error('Anthropic API key not configured');
            rawResponse = await handleAnthropicRequest(prompt, apiKeys.anthropic);
            break;
          case 'gemini':
            if (!apiKeys.gemini) throw new Error('Google API key not configured');
            rawResponse = await handleGeminiRequest(prompt, apiKeys.gemini);
            break;
          case 'ollama':
            if (!apiKeys.ollama_endpoint) throw new Error('Ollama endpoint not configured');
            rawResponse = await handleOllamaRequest(prompt, apiKeys.ollama_endpoint, model);
            break;
          }
        }

        const processedResponse = processResponse(rawResponse);
        const vulnerabilityAnalysis = await analyzeVulnerability(prompt, processedResponse);
        
        return {
          prompt,
          model_response: processedResponse,
          raw_response: rawResponse,
          vulnerability_analysis: vulnerabilityAnalysis.analysis,
          is_vulnerable: vulnerabilityAnalysis.isVulnerable,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error processing prompt "${prompt}":`, error);
        return {
          prompt,
          error: error.message,
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

    const { scanId, prompts, provider, category, label, schedule, isRecurring, qps = 5, customEndpoint } = await req.json();

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      throw new Error('Invalid prompts array');
    }

    // Modified validation to allow custom endpoints
    if (!provider && !customEndpoint) {
      throw new Error('Provider or custom endpoint configuration is required');
    }

    // Process prompts with QPS control, passing the user ID to get their API keys
    const results = await processBatch(prompts, provider, user.id, qps, customEndpoint);

    // Update scan with results
    const { error: updateError } = await supabase
      .from('llm_scans')
      .update({
        results: {
          prompts: prompts,
          responses: results,
          timestamp: new Date().toISOString(),
        },
        status: 'completed',
        is_vulnerable: results.some(r => r.is_vulnerable === true),
      })
      .eq('id', scanId);

    if (updateError) {
      throw new Error('Failed to update scan results');
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scan error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
