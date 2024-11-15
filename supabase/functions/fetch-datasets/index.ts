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
    const { category, useCustomSearch, searchQuery } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw userError || new Error('User not found')
    }

    // Get the user's Hugging Face API key
    const { data: profile, error: profileError } = await supabaseClient
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

    // Construct the search query based on category and custom search
    let searchUrl = 'https://huggingface.co/api/datasets'
    const searchParams = new URLSearchParams()
    
    if (useCustomSearch && searchQuery) {
      // If using custom search, use the search query directly
      searchParams.append('search', searchQuery)
    } else if (category) {
      // If using category, search by category
      searchParams.append('filter', category.toLowerCase())
    }
    
    // Add the search parameters to the URL if they exist
    if (searchParams.toString()) {
      searchUrl += `?${searchParams.toString()}`
    }

    console.log(`Fetching datasets from: ${searchUrl}`)

    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${huggingFaceApiKey}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', errorText)
      throw new Error(`Failed to fetch datasets: ${response.statusText}`)
    }

    const datasets = await response.json()

    // Transform the response to match our frontend expectations
    const transformedDatasets = datasets.map((dataset: any) => ({
      id: dataset.id,
      title: dataset.id.split('/').pop(),
      description: dataset.description || 'No description available',
      downloads: dataset.downloads || 0,
      likes: dataset.likes || 0,
    }))

    return new Response(
      JSON.stringify({ datasets: transformedDatasets }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in fetch-datasets function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})