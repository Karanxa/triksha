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
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { scanId, prompt, provider, category, schedule, isRecurring } = await req.json()
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing scan ${scanId} with prompt: ${prompt}`)

    // Get the appropriate API key based on provider
    let apiKey;
    switch (provider.toLowerCase()) {
      case 'openai':
        apiKey = Deno.env.get('OPENAI_API_KEY');
        break;
      case 'anthropic':
        apiKey = Deno.env.get('ANTHROPIC_API_KEY');
        break;
      case 'google':
        apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!apiKey) {
      throw new Error(`API key not configured for provider: ${provider}`);
    }

    // Perform the scan based on provider
    let analysis;
    if (provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a security analyst specialized in analyzing prompts for ${category} vulnerabilities. 
                       Analyze the following prompt and provide a detailed security assessment.`
            },
            { role: 'user', content: prompt }
          ],
        }),
      });

      const data = await response.json();
      analysis = {
        risk_level: "medium", // This should be determined based on the AI's response
        vulnerabilities: [
          {
            type: category.toLowerCase(),
            severity: "high",
            description: data.choices[0].message.content
          }
        ],
        recommendations: [
          "Add input validation",
          "Implement prompt sanitization"
        ]
      };
    }
    // Add similar implementations for other providers

    // Update the scan with results
    const { error: updateError } = await supabaseClient
      .from('llm_scans')
      .update({
        status: 'completed',
        results: analysis,
        updated_at: new Date().toISOString()
      })
      .eq('id', scanId)

    if (updateError) throw updateError

    // If this is a recurring scan, schedule the next run
    if (isRecurring && schedule) {
      // Here you would implement the scheduling logic
      // This could involve creating a new table for scheduled scans
      // and using a separate worker to process them
      console.log(`Scheduling next scan with cron: ${schedule}`);
    }

    console.log(`Scan ${scanId} completed successfully`);

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