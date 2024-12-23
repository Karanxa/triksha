import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, model, prompt, customEndpoint } = await req.json();
    console.log('Fingerprinting request:', { provider, model, prompt, customEndpoint });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) throw new Error('Invalid user token');

    // Get user's API keys
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError) throw new Error('Failed to fetch user profile');
    if (!profile?.api_keys) throw new Error('API keys not configured');

    let response;
    const normalizedProvider = provider.toLowerCase();
    
    switch (normalizedProvider) {
      case 'openai':
        const openaiKey = profile.api_keys.openai;
        if (!openaiKey) throw new Error('OpenAI API key not configured in Settings');
        response = await handleOpenAIRequest(prompt, model, openaiKey);
        break;
        
      case 'anthropic':
        const anthropicKey = profile.api_keys.anthropic;
        if (!anthropicKey) throw new Error('Anthropic API key not configured in Settings');
        response = await handleAnthropicRequest(prompt, model, anthropicKey);
        break;
        
      case 'google':
        const googleKey = profile.api_keys.gemini;
        if (!googleKey) throw new Error('Google API key not configured in Settings');
        response = await handleGoogleRequest(prompt, model, googleKey);
        break;
        
      case 'ollama':
        const ollamaEndpoint = profile.api_keys.ollama_endpoint;
        if (!ollamaEndpoint) throw new Error('Ollama endpoint not configured in Settings');
        response = await handleOllamaRequest(prompt, model, ollamaEndpoint);
        break;

      case 'custom':
        if (!customEndpoint) throw new Error('Custom endpoint configuration is required');
        response = await handleCustomRequest(prompt, customEndpoint);
        break;
        
      default:
        throw new Error(`Unsupported provider: ${provider}. Supported providers are: openai, anthropic, google, ollama, custom`);
    }

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in contextual-fingerprint function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleOpenAIRequest(prompt: string, model: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model === 'gpt-4' ? 'gpt-4-0125-preview' : 'gpt-3.5-turbo-0125',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function handleAnthropicRequest(prompt: string, model: string, apiKey: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'claude-3-opus-20240229',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function handleGoogleRequest(prompt: string, model: string, apiKey: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
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
    throw new Error(`Google API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function handleOllamaRequest(prompt: string, model: string, endpoint: string) {
  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'llama2',
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${error}`);
  }

  const data = await response.json();
  return data.response;
}

async function handleCustomRequest(prompt: string, customEndpoint: any) {
  try {
    // Parse the curl command if provided
    if (customEndpoint.curlCommand) {
      const modifiedCommand = customEndpoint.curlCommand
        .replace(customEndpoint.placeholder || '{PROMPT}', prompt);
      
      // Execute the modified curl command
      // Note: This is a simplified version, you might need to parse headers, method, etc.
      const response = await fetch(customEndpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {})
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`Custom endpoint error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || data.text || data.content || JSON.stringify(data);
    }

    // Default HTTP request if no curl command
    const response = await fetch(customEndpoint.url, {
      method: customEndpoint.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {})
      },
      body: JSON.stringify({
        [customEndpoint.placeholder || 'prompt']: prompt
      })
    });

    if (!response.ok) {
      throw new Error(`Custom endpoint error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || data.text || data.content || JSON.stringify(data);
  } catch (error) {
    console.error('Error in custom request:', error);
    throw new Error(`Custom endpoint error: ${error.message}`);
  }
}