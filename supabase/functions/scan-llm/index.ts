import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompts, provider, customEndpoint } = await req.json();

    if (!scanId || !prompts || !provider) {
      throw new Error('Missing required parameters');
    }

    let response;
    const baseProvider = provider.split('-')[0];

    if (baseProvider === 'custom' && customEndpoint) {
      try {
        const headers = customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {};
        if (customEndpoint.apiKey) {
          headers['Authorization'] = `Bearer ${customEndpoint.apiKey}`;
        }

        const results = await Promise.all(prompts.map(async (prompt) => {
          const response = await fetch(customEndpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            body: JSON.stringify({
              prompt: prompt.replace(customEndpoint.placeholder, prompt)
            }),
          });

          if (!response.ok) {
            throw new Error(`Custom endpoint error: ${response.statusText}`);
          }

          return await response.json();
        }));

        response = { results };
      } catch (error) {
        console.error('Custom endpoint error:', error);
        throw new Error(`Custom endpoint error: ${error.message}`);
      }
    } else if (baseProvider === 'ollama') {
      response = await handleOllamaRequest(prompts[0], provider.split('-')[1]);
    } else {
      // Handle other providers...
      throw new Error('Provider not implemented');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in scan-llm function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
