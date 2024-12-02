import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log('Request received:', { provider, model, prompt });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User authentication failed:', userError);
      throw new Error('Invalid user token');
    }

    // Get user's API keys
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to fetch user profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }
    if (!profile?.api_keys) {
      console.error('No API keys found in profile');
      throw new Error('API keys not configured');
    }

    let modelResponse;
    console.log('Attempting to get model response...');

    if (provider === 'custom' && customEndpoint) {
      console.log('Using custom endpoint');
      modelResponse = await handleCustomRequest(prompt, customEndpoint);
    } else if (provider === 'openai') {
      console.log('Using OpenAI endpoint');
      const openaiKey = profile.api_keys.openai;
      if (!openaiKey) {
        console.error('OpenAI API key not found in profile');
        throw new Error('OpenAI API key not configured in Settings');
      }
      modelResponse = await handleOpenAIRequest(prompt, model, openaiKey);
      console.log('OpenAI response received:', modelResponse ? 'success' : 'null');
    } else if (provider === 'anthropic') {
      console.log('Using Anthropic endpoint');
      const anthropicKey = profile.api_keys.anthropic;
      if (!anthropicKey) throw new Error('Anthropic API key not configured in Settings');
      modelResponse = await handleAnthropicRequest(prompt, model, anthropicKey);
    } else {
      console.error('Unsupported provider:', provider);
      throw new Error('Unsupported provider');
    }

    // Validate response
    if (!modelResponse || typeof modelResponse !== 'string') {
      console.error('Invalid response format:', modelResponse);
      throw new Error('Invalid response format from model');
    }

    // Store the interaction in the database
    const { error: insertError } = await supabase
      .from('contextual_scans')
      .insert({
        user_id: user.id,
        provider,
        model,
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: modelResponse }
        ]
      });

    if (insertError) {
      console.error('Error storing scan:', insertError);
    }

    console.log('Successfully processed request, sending response');
    return new Response(
      JSON.stringify({ response: modelResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in contextual-fingerprint function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleCustomRequest(prompt: string, customEndpoint: any) {
  console.log('Processing custom request');
  const { url, method, headers: rawHeaders, inputType, httpRequest, curlCommand } = customEndpoint;
  
  let requestUrl = url;
  let requestBody;
  let headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (rawHeaders) {
    try {
      const parsedHeaders = JSON.parse(rawHeaders);
      headers = { ...headers, ...parsedHeaders };
    } catch (error) {
      console.error('Error parsing custom headers:', error);
    }
  }

  if (inputType === 'http') {
    requestBody = httpRequest.replace('{PROMPT}', prompt);
  } else if (inputType === 'curl') {
    requestBody = curlCommand.replace('{PROMPT}', prompt);
  } else {
    requestBody = JSON.stringify({ prompt });
  }

  console.log('Making custom request:', {
    url: requestUrl,
    method,
    headers,
    body: requestBody
  });

  const response = await fetch(requestUrl, {
    method,
    headers,
    body: requestBody
  });

  if (!response.ok) {
    throw new Error(`Custom endpoint returned status ${response.status}`);
  }

  const data = await response.json();
  return data.response || data;
}

async function handleOpenAIRequest(prompt: string, model: string, apiKey: string) {
  console.log('Making OpenAI request with model:', model);
  
  const modelMap: { [key: string]: string } = {
    'gpt-4o': 'gpt-4-0125-preview',
    'gpt-4o-mini': 'gpt-3.5-turbo-0125',
  };

  const apiModel = modelMap[model] || 'gpt-3.5-turbo-0125';
  console.log('Using API model:', apiModel);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: apiModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  const data = await response.json();
  console.log('OpenAI response structure:', JSON.stringify(data, null, 2));
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
      model,
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