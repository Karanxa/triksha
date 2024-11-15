import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompts, provider, category } = await req.json();
    
    console.log(`Processing scan ${scanId} with ${prompts.length} prompts`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw userError || new Error('User not found');
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    const apiKey = profile?.api_keys?.[provider];
    if (!apiKey) {
      throw new Error(`${provider} API key not found. Please add it in the Settings.`);
    }

    // Process each prompt individually and store results
    const results = [];
    for (const prompt of prompts) {
      try {
        console.log('Processing prompt:', prompt);
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('OpenAI API error:', error);
          throw new Error(`OpenAI API error: ${error}`);
        }

        const data = await response.json();
        const modelResponse = data.choices[0].message.content;

        // Create individual scan record for each prompt
        const { data: scan, error: scanError } = await supabaseClient
          .from('llm_scans')
          .insert({
            user_id: user.id,
            name: `Scan ${new Date().toISOString()}`,
            status: 'completed',
            results: {
              prompt: prompt,
              model_response: modelResponse
            },
            category: category
          })
          .select()
          .single();

        if (scanError) {
          console.error('Error creating scan:', scanError);
          throw new Error('Failed to create scan');
        }

        results.push(scan);
      } catch (error) {
        console.error(`Error processing prompt: ${error}`);
        results.push({
          error: error.message,
          prompt: prompt
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in scan-llm function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});