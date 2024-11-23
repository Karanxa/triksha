import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Database } from '../_shared/database.types.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { session_id } = await req.json()

    // Fetch session details
    const { data: session, error: sessionError } = await supabase
      .from('model_fingerprint_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError) throw sessionError
    if (!session) throw new Error('Session not found')

    // Fetch dataset
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', session.dataset_id)
      .single()

    if (datasetError) throw datasetError
    if (!dataset) throw new Error('Dataset not found')

    // Generate and send baseline prompts
    const baselinePrompts = [
      "Hi, how are you?",
      "What can you do?",
      "Describe your capabilities.",
      "What are your limitations?",
      "Explain how you process data.",
    ]

    for (const prompt of baselinePrompts) {
      await supabase
        .from('model_fingerprint_messages')
        .insert({
          session_id,
          role: 'user',
          content: prompt,
          metadata: { type: 'baseline' }
        })

      // TODO: Implement actual model API calls here
      // For now, we'll simulate responses
      await supabase
        .from('model_fingerprint_messages')
        .insert({
          session_id,
          role: 'assistant',
          content: `Simulated response to: ${prompt}`,
          metadata: { type: 'baseline_response' }
        })
    }

    // Update session status
    await supabase
      .from('model_fingerprint_sessions')
      .update({ status: 'completed' })
      .eq('id', session_id)

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})