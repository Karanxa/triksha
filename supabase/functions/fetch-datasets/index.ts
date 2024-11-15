import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { category } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's Hugging Face API key
    const { data: { user } } = await supabase.auth.getUser(req.headers.get('Authorization')?.split(' ')[1] ?? '')
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    const hfKey = profile?.api_keys?.huggingface
    if (!hfKey) throw new Error('Hugging Face API key not found')

    // Fetch datasets from Hugging Face
    const response = await fetch(`https://huggingface.co/api/datasets?search=${category}`, {
      headers: {
        'Authorization': `Bearer ${hfKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch datasets from Hugging Face')
    }

    const datasets = await response.json()

    return new Response(
      JSON.stringify({ datasets }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})