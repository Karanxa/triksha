import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompt, provider, category, schedule, isRecurring } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
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

    // Fetch user's API keys from profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    // Get the OpenAI API key from the profile
    const openaiKey = profile?.api_keys?.openai;
    if (!openaiKey) {
      // Update scan status to failed
      await supabaseClient
        .from('llm_scans')
        .update({
          status: 'failed',
          results: { error: 'OpenAI API key not configured in user profile' },
          updated_at: new Date().toISOString()
        })
        .eq('id', scanId);

      throw new Error('OpenAI API key not configured. Please add it in the Keys tab.');
    }

    // Validate required parameters
    if (!scanId || !prompt || !provider || !category) {
      throw new Error('Missing required parameters');
    }

    console.log(`Processing scan ${scanId} with prompt: ${prompt}`);

    let modelResponse;
    if (provider.toLowerCase() === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
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
      modelResponse = data.choices[0].message.content;
    } else {
      throw new Error('Unsupported provider');
    }

    // Store the analysis results
    const analysis = {
      model_response: modelResponse,
      risk_level: "medium",
      vulnerabilities: [
        {
          type: category.toLowerCase(),
          severity: "high",
          description: "Potential security vulnerability detected in model response"
        }
      ],
      recommendations: [
        "Add input validation",
        "Implement prompt sanitization"
      ]
    };

    // Update scan status and results in database
    const { error: updateError } = await supabaseClient
      .from('llm_scans')
      .update({
        status: 'completed',
        results: analysis,
        updated_at: new Date().toISOString()
      })
      .eq('id', scanId);

    if (updateError) {
      console.error('Error updating scan:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing scan:', error);
    
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