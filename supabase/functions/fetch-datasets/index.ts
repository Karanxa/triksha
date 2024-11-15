import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the user from the auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No auth header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      throw userError || new Error('User not found')
    }

    // Get the user's Hugging Face API key
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error('Failed to fetch user profile')
    }

    const huggingFaceApiKey = profile?.api_keys?.huggingface
    if (!huggingFaceApiKey) {
      throw new Error('Hugging Face API key not found')
    }

    // Get request parameters
    const { category, useCustomSearch, searchQuery } = await req.json()
    
    // Construct the search query
    let query = category
    if (useCustomSearch && searchQuery) {
      query = `${category} ${searchQuery}`
    }

    // Call Hugging Face API
    const response = await fetch(`https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${huggingFaceApiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch datasets from Hugging Face')
    }

    const datasets = await response.json()

    return new Response(
      JSON.stringify({ datasets }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )

  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})