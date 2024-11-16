import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { analyzeVulnerability } from "./utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompts, provider, category, customEndpoint } = await req.json();
    console.log(`Starting scan ${scanId} with prompts:`, prompts);

    if (!scanId || !prompts || !provider) {
      throw new Error('Missing required parameters');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update scan status to processing
    await supabase
      .from('llm_scans')
      .update({ 
        status: 'processing',
        results: null
      })
      .eq('id', scanId);

    let scanResults;
    const baseProvider = provider.split('-')[0];

    if (baseProvider === 'custom' && customEndpoint) {
      console.log('Processing custom endpoint request...');
      try {
        const response = await processCustomEndpoint(
          customEndpoint,
          prompts[0]
        );
        scanResults = {
          prompt: prompts[0],
          model_response: response
        };
      } catch (error) {
        throw new Error(`Custom endpoint error: ${error.message}`);
      }
    } else if (baseProvider === 'ollama') {
      console.log('Processing Ollama request...');
      const modelResponse = await handleOllamaRequest(prompts[0], provider.split('-')[1]);
      scanResults = {
        prompt: prompts[0],
        model_response: modelResponse
      };
    } else {
      throw new Error('Provider not implemented');
    }

    // Add metadata to results
    scanResults = {
      ...scanResults,
      category,
      timestamp: new Date().toISOString()
    };

    // Analyze for vulnerabilities
    const isVulnerable = analyzeVulnerability(category, scanResults.model_response);

    console.log(`Storing results for scan ${scanId}:`, scanResults);

    // Update scan with results and mark as completed
    const { error: updateError } = await supabase
      .from('llm_scans')
      .update({
        results: scanResults,
        status: 'completed',
        is_vulnerable: isVulnerable
      })
      .eq('id', scanId);

    if (updateError) {
      console.error(`Error updating scan ${scanId}:`, updateError);
      throw updateError;
    }

    return new Response(JSON.stringify(scanResults), {
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

async function processCustomEndpoint(customEndpoint: any, prompt: string) {
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
    body = { prompt };
  }

  console.log(`Making request to custom endpoint for prompt: ${prompt}`);
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Custom endpoint error: ${response.statusText}`);
  }

  const responseData = await response.json();
  return responseData.response || responseData.model_response || responseData.text || JSON.stringify(responseData);
}

function parseCurlCommand(curlCommand: string, placeholder: string, prompt: string) {
  const urlMatch = curlCommand.match(/curl ['"]([^'"]+)['"]/);
  const headersMatch = curlCommand.match(/-H ['"]([^'"]+)['"]/g);
  const dataMatch = curlCommand.match(/-d ['"]([^'"]+)['"]/);
  
  if (!urlMatch) {
    throw new Error('Invalid cURL command: URL not found');
  }

  const url = urlMatch[1];
  const headers: Record<string, string> = {};
  
  headersMatch?.forEach(header => {
    const [key, value] = header.match(/-H ['"]([^'"]+)['"]/)?.[1].split(': ') ?? [];
    if (key && value) {
      headers[key] = value;
    }
  });

  let body = dataMatch?.[1] ?? '{}';
  body = body.replace(placeholder, prompt);

  try {
    body = JSON.parse(body);
  } catch {
    throw new Error('Invalid JSON body in cURL command');
  }

  return { url, headers, body };
}