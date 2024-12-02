import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { provider, model, prompt, apiKey, customEndpoint } = await req.json();
    console.log('Processing dynamic scan:', { provider, model, promptLength: prompt?.length });

    if (!apiKey) {
      throw new Error(`API key not found for provider: ${provider}`);
    }

    let response;
    const startTime = Date.now();

    if (provider === 'openai') {
      console.log('Making OpenAI request...');
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model === 'gpt-4o' ? 'gpt-4-0125-preview' : 'gpt-3.5-turbo-0125',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${errorText}`);
      }

      const data = await openaiResponse.json();
      response = data.choices[0].message.content;
    } else if (provider === 'anthropic') {
      console.log('Making Anthropic request...');
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        }),
      });

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text();
        console.error('Anthropic API error:', errorText);
        throw new Error(`Anthropic API error: ${errorText}`);
      }

      const data = await anthropicResponse.json();
      response = data.content[0].text;
    } else if (provider === 'custom' && customEndpoint) {
      console.log('Making custom endpoint request...');
      const customResponse = await fetch(customEndpoint.url, {
        method: customEndpoint.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {})
        },
        body: JSON.stringify({ prompt }),
      });

      if (!customResponse.ok) {
        const errorText = await customResponse.text();
        console.error('Custom endpoint error:', errorText);
        throw new Error(`Custom endpoint error: ${errorText}`);
      }

      const data = await customResponse.json();
      response = data.response || data.text || JSON.stringify(data);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const endTime = Date.now();
    console.log(`Request completed in ${endTime - startTime}ms`);

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in dynamic scan:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // We return 200 but with error in payload to handle it gracefully in frontend
      }
    );
  }
});