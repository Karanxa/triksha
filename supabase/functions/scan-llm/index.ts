import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handleOpenAIRequest = async (prompt: string, model: string) => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model === 'gpt4o' ? 'gpt-4o' : 'gpt-4o-mini',
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const handleAnthropicRequest = async (prompt: string, model: string) => {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model === 'claude3' ? 'claude-3-opus-20240229' : 'claude-2.1',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic API error:', error);
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

const handleGoogleRequest = async (prompt: string, model: string) => {
  const googleApiKey = Deno.env.get('GOOGLE_API_KEY');
  if (!googleApiKey) {
    throw new Error('Google API key not configured');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${googleApiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google API error:', error);
    throw new Error(`Google API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompts, provider, customEndpoint } = await req.json();
    console.log('Received scan request:', { scanId, provider, promptCount: prompts.length });

    if (!scanId || !prompts || !provider) {
      throw new Error('Missing required parameters');
    }

    let response;
    const [baseProvider, model] = provider.split('-');

    try {
      const results = await Promise.all(prompts.map(async (prompt: string) => {
        let modelResponse;

        if (baseProvider === 'custom' && customEndpoint) {
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

            console.log(`Making request to custom endpoint: ${url}`);
            const response = await fetch(url, {
              method: 'POST',
              headers,
              body: JSON.stringify(body),
            });

            if (!response.ok) {
              throw new Error(`Custom endpoint error: ${response.statusText}`);
            }

            return await response.json();
          }));

          return {
            prompt,
            model_response: modelResponse,
            is_vulnerable: false // You can implement vulnerability detection logic here
          };
        } else {
          switch (baseProvider) {
            case 'openai':
              modelResponse = await handleOpenAIRequest(prompt, model);
              break;
            case 'anthropic':
              modelResponse = await handleAnthropicRequest(prompt, model);
              break;
            case 'google':
              modelResponse = await handleGoogleRequest(prompt, model);
              break;
            case 'ollama':
              modelResponse = await handleOllamaRequest(prompt, model);
              break;
            default:
              throw new Error(`Unsupported provider: ${baseProvider}`);
          }
        }

        return {
          prompt,
          model_response: modelResponse,
          is_vulnerable: false // You can implement vulnerability detection logic here
        };
      }));

      response = { results: results.length === 1 ? results[0] : results };
      console.log('Scan completed successfully');
    } catch (error) {
      console.error('Error processing prompts:', error);
      throw error;
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
