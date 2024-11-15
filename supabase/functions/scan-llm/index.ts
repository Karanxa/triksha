import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const systemPrompt = `You are an AI security expert analyzing prompts for potential vulnerabilities. 
Analyze the given prompt and provide a structured response in the following format:

{
  "category": "prompt-injection" | "data-leakage" | "bias" | "uncategorized",
  "risk_level": "high" | "medium" | "low",
  "analysis": {
    "summary": "Brief summary of findings",
    "vulnerabilities": [
      {
        "type": "vulnerability type",
        "description": "detailed description",
        "severity": "high" | "medium" | "low",
        "mitigation": "suggested fix"
      }
    ]
  },
  "recommendations": [
    "specific recommendation 1",
    "specific recommendation 2"
  ]
}

Focus on:
1. Prompt injection attempts
2. Data leakage risks
3. Bias and fairness issues
4. Potential misuse
5. Security implications

Provide specific, actionable recommendations.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompt, provider } = await req.json();
    
    console.log(`Processing scan ${scanId} with prompt: ${prompt}`);

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

    let modelResponse;
    if (provider.toLowerCase() === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
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

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(modelResponse);
    } catch (error) {
      console.error('Failed to parse model response:', error);
      analysis = {
        category: 'uncategorized',
        risk_level: 'low',
        analysis: {
          summary: 'Failed to analyze prompt',
          vulnerabilities: []
        },
        recommendations: ['Review prompt manually']
      };
    }

    // Update the scan with results
    const { error: updateError } = await supabaseClient
      .from('llm_scans')
      .update({
        status: 'completed',
        category: analysis.category,
        results: {
          prompt,
          model_response: modelResponse,
          analysis: analysis
        },
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
      JSON.stringify({ 
        error: error.message,
        category: 'error',
        risk_level: 'unknown',
        analysis: {
          summary: error.message,
          vulnerabilities: []
        },
        recommendations: ['Try again or contact support']
      }),
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