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

    // Construct search parameters
    const baseUrl = 'https://huggingface.co/api/datasets'
    const params = new URLSearchParams()

    if (useCustomSearch && searchQuery) {
      params.append('search', searchQuery.toLowerCase())
    } else if (category) {
      // Use the category directly as a search term
      params.append('search', category.toLowerCase())
    }

    // Add basic filters for quality results
    params.append('sort', 'downloads')
    params.append('limit', '20')
    
    const searchUrl = `${baseUrl}?${params.toString()}`
    console.log('Fetching datasets from:', searchUrl)

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
    
    if (!Array.isArray(datasets)) {
      console.error('Unexpected API response format:', datasets)
      throw new Error('Invalid response format from Hugging Face API')
    }

    // Filter results to ensure they match the category if specified
    let filteredDatasets = datasets
    if (category && !useCustomSearch) {
      const categoryLower = category.toLowerCase()
      filteredDatasets = datasets.filter((dataset: any) => {
        const description = (dataset.description || '').toLowerCase()
        const title = (dataset.id || '').toLowerCase()
        const tags = (dataset.tags || []).map((tag: string) => tag.toLowerCase())
        
        return (
          description.includes(categoryLower) || 
          title.includes(categoryLower) || 
          tags.includes(categoryLower)
        )
      })
    }

    return new Response(
      JSON.stringify({ datasets: filteredDatasets }),
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
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})