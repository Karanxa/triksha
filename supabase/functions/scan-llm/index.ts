import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { scanId, prompt, provider, category } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('authorization')?.split('Bearer ')[1]
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader)
    if (userError || !user) {
      throw new Error('Failed to get user')
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Failed to get user profile')
    }

    const apiKeys = profile.api_keys || {}
    const apiKey = apiKeys[provider.toLowerCase()]
    
    if (!apiKey) {
      throw new Error(`Please configure your ${provider} API key in Settings`)
    }

    console.log(`Processing scan ${scanId} with prompt: ${prompt}`)

    let modelResponse;
    if (provider.toLowerCase() === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
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
        throw new Error(`OpenAI API error: ${error}`);
      }

      const data = await response.json();
      modelResponse = data.choices[0].message.content;
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
      .eq('id', scanId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, data: analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing scan:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})