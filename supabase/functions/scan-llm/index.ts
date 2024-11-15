import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, userId } = await req.json()

    // Here we would integrate with the actual LLM API
    // For now, we'll simulate a response
    const analysis = {
      risk_level: "medium",
      vulnerabilities: [
        {
          type: "prompt_injection",
          severity: "high",
          description: "Potential for prompt injection detected"
        }
      ],
      recommendations: [
        "Add input validation",
        "Implement prompt sanitization"
      ]
    }

    // Store the results in the database
    const { data: client } = await supabase.from('llm_scans').insert({
      user_id: userId,
      name: "Scan " + new Date().toISOString(),
      status: "completed",
      results: analysis
    }).select()

    return new Response(
      JSON.stringify({ success: true, data: analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})