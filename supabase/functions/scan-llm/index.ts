import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const parseCurlCommand = (curlCommand: string, placeholder: string, prompt: string) => {
  const urlMatch = curlCommand.match(/curl ['"]([^'"]+)['"]/);
  const headersMatch = curlCommand.match(/-H ['"]([^'"]+)['"]/g);
  const dataMatch = curlCommand.match(/-d ['"]([^'"]+)['"]/);
  
  if (!urlMatch) {
    throw new Error('Invalid cURL command: URL not found');
  }

  const url = urlMatch[1];
  const headers: Record<string, string> = {};
  
  // Parse headers
  headersMatch?.forEach(header => {
    const [key, value] = header.match(/-H ['"]([^'"]+)['"]/)?.[1].split(': ') ?? [];
    if (key && value) {
      headers[key] = value;
    }
  });

  // Parse body
  let body = dataMatch?.[1] ?? '{}';
  body = body.replace(placeholder, prompt);

  try {
    body = JSON.parse(body);
  } catch {
    throw new Error('Invalid JSON body in cURL command');
  }

  return { url, headers, body };
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let response;
    const baseProvider = provider.split('-')[0];

    if (baseProvider === 'custom' && customEndpoint) {
      try {
        const results = await Promise.all(prompts.map(async (prompt) => {
          let url: string;
          let headers: Record<string, string> = {};
          let body: any;

          if (customEndpoint.inputType === 'curl') {
            const parsed = parseCurlCommand(
              customEndpoint.curlCommand,
              customEndpoint.placeholder,
              prompt
            );
            url = parsed.url;
            headers = parsed.headers;
            body = parsed.body;
          } else {
            url = customEndpoint.url;
            headers = {
              'Content-Type': 'application/json',
              ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {}),
            };
            if (customEndpoint.apiKey) {
              headers['Authorization'] = `Bearer ${customEndpoint.apiKey}`;
            }
            body = { prompt: prompt };
          }

          const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            throw new Error(`Custom endpoint error: ${response.statusText}`);
          }

          const responseData = await response.json();
          return {
            prompt,
            model_response: responseData.response || responseData.model_response || responseData.text || JSON.stringify(responseData)
          };
        }));

        // Update scan with results
        const { error: updateError } = await supabase
          .from('llm_scans')
          .update({
            results: { results },
            status: 'completed'
          })
          .eq('id', scanId);

        if (updateError) {
          throw updateError;
        }

        response = prompts.length > 1 ? { results } : results[0];
      } catch (error) {
        console.error('Custom endpoint error:', error);
        throw new Error(`Custom endpoint error: ${error.message}`);
      }
    } else if (baseProvider === 'ollama') {
      const result = await handleOllamaRequest(prompts[0], provider.split('-')[1]);
      response = {
        prompt: prompts[0],
        model_response: result
      };

      // Update scan with result
      const { error: updateError } = await supabase
        .from('llm_scans')
        .update({
          results: response,
          status: 'completed'
        })
        .eq('id', scanId);

      if (updateError) {
        throw updateError;
      }
    } else {
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
