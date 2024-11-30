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
    const { provider, model, prompt, scanId } = await req.json();
    console.log('Processing fingerprint request:', { provider, model, prompt, scanId });

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

    let modelResponse;
    if (provider === 'openai') {
      const openaiKey = profile.api_keys.openai;
      if (!openaiKey) throw new Error('OpenAI API key not configured in Settings');
      
      console.log('Making OpenAI request...');
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model === 'gpt-4o' ? 'gpt-4-0125-preview' : 'gpt-3.5-turbo-0125',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        const error = await openaiResponse.text();
        console.error('OpenAI API error:', error);
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await openaiResponse.json();
      modelResponse = data.choices[0].message.content;
      console.log('Received OpenAI response:', modelResponse);
    } else if (provider === 'anthropic') {
      const anthropicKey = profile.api_keys.anthropic;
      if (!anthropicKey) throw new Error('Anthropic API key not configured in Settings');
      
      console.log('Making Anthropic request...');
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        }),
      });

      if (!anthropicResponse.ok) {
        const error = await anthropicResponse.text();
        console.error('Anthropic API error:', error);
        throw new Error(`Anthropic API error: ${error}`);
      }

      const data = await anthropicResponse.json();
      modelResponse = data.content[0].text;
      console.log('Received Anthropic response:', modelResponse);
    } else {
      throw new Error('Unsupported provider');
    }

    // Update scan with response if scanId is provided
    if (scanId) {
      console.log('Updating scan with response:', { scanId, modelResponse });
      const { error: updateError } = await supabase
        .from('contextual_scans')
        .update({
          messages: supabase.sql`array_append(messages, jsonb_build_object('role', 'assistant', 'content', ${modelResponse}))`
        })
        .eq('id', scanId);

      if (updateError) {
        console.error('Error updating scan:', updateError);
        throw new Error(`Failed to update scan: ${updateError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ response: modelResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in geraide-fingerprint function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});