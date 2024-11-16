import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name, description, basePrompt, numSamples } = await req.json()

    // Validate input
    if (!name || !basePrompt || !numSamples) {
      throw new Error('Missing required fields')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw userError || new Error('User not found')
    }

    // TODO: Implement EasyJailbreak integration
    // For now, we'll just create a dataset entry
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .insert({
        name,
        description,
        user_id: user.id,
        category: 'jailbreaking'
      })
      .select()
      .single()

    if (datasetError) {
      throw new Error('Failed to create dataset')
    }

    return new Response(
      JSON.stringify({ success: true, dataset }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})