import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const systemPrompt = `You are an AI security expert analyzing prompts for potential vulnerabilities. 
Your task is to:
1. Analyze the given prompt for security risks
2. Identify potential vulnerabilities
3. Classify the type of attack (if any)
4. Provide a detailed response explaining the risks
5. Suggest mitigations

Focus on these vulnerability categories:
- Prompt injection
- Data leakage
- Bias and fairness
- Jailbreaking attempts
- Harmful content generation

Format your response to be clear and actionable.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompt, provider, category, schedule, isRecurring } = await req.json();
    
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
      throw new Error(`${provider} API key not found. Please add it in the Keys tab.`);
    }

    console.log(`Processing scan ${scanId} with prompt: ${prompt}`);

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

    // Analyze the response for risk level
    const riskIndicators = [
      'vulnerability', 'risk', 'exploit', 'injection', 'leak', 'sensitive', 'harmful'
    ];
    
    const riskLevel = riskIndicators.some(indicator => 
      modelResponse.toLowerCase().includes(indicator)) ? 'high' : 'low';

    // Store the analysis results
    const analysis = {
      prompt,
      model_response: modelResponse,
      risk_level: riskLevel,
      category: category.toLowerCase(),
      vulnerabilities: [
        {
          type: category.toLowerCase(),
          severity: riskLevel,
          description: "Potential security vulnerability detected in model response"
        }
      ],
      recommendations: [
        "Implement input validation",
        "Add prompt sanitization",
        "Use content filtering",
        "Monitor model outputs"
      ],
      timestamp: new Date().toISOString()
    };

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