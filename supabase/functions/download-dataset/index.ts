import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { datasetId, format } = await req.json()
    console.log('Download request:', { datasetId, format })

    if (!datasetId) {
      throw new Error('Dataset ID is required')
    }

    // Get user from auth header for API key access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's API key
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.api_keys?.huggingface) {
      throw new Error('Hugging Face API key not configured')
    }

    // Fetch dataset info from Hugging Face
    const infoResponse = await fetch(`https://huggingface.co/api/datasets/${datasetId}`, {
      headers: {
        'Authorization': `Bearer ${profile.api_keys.huggingface}`
      }
    })

    if (!infoResponse.ok) {
      console.error('Failed to fetch dataset info:', await infoResponse.text())
      throw new Error('Failed to fetch dataset info from Hugging Face')
    }

    const datasetInfo = await infoResponse.json()
    console.log('Dataset info:', datasetInfo)

    // Fetch the dataset content
    const response = await fetch(`https://huggingface.co/datasets/${datasetId}/raw/main/data.csv`, {
      headers: {
        'Authorization': `Bearer ${profile.api_keys.huggingface}`
      }
    })

    if (!response.ok) {
      console.error('Failed to fetch dataset:', await response.text())
      throw new Error('Failed to fetch dataset from Hugging Face')
    }

    const content = await response.text()
    const filename = `${datasetId.split('/').pop()}.csv`

    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Download dataset error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})