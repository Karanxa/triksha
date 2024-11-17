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
    const { datasetId, format } = await req.json()
    console.log('Download request:', { datasetId, format })
    
    if (!datasetId) {
      throw new Error('Dataset ID is required')
    }

    // Initialize Supabase client
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
      throw new Error('Unauthorized')
    }

    // Get user's API keys
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.api_keys) {
      throw new Error('Failed to fetch user profile')
    }

    let content: string
    let contentType: string
    let filename: string

    // For Hugging Face datasets
    if (datasetId.includes('/')) {
      console.log('Fetching Hugging Face dataset:', datasetId)
      
      if (!profile.api_keys.huggingface) {
        throw new Error('Hugging Face API key not configured')
      }

      // Fetch dataset info first
      const infoResponse = await fetch(`https://huggingface.co/api/datasets/${datasetId}`, {
        headers: {
          'Authorization': `Bearer ${profile.api_keys.huggingface}`
        }
      })

      if (!infoResponse.ok) {
        console.error('Failed to fetch dataset info:', await infoResponse.text())
        throw new Error('Failed to fetch dataset info from Hugging Face')
      }

      // Fetch the actual dataset content
      const response = await fetch(`https://huggingface.co/datasets/${datasetId}/raw/main/data.csv`, {
        headers: {
          'Authorization': `Bearer ${profile.api_keys.huggingface}`
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch dataset content:', await response.text())
        throw new Error('Failed to fetch dataset content from Hugging Face')
      }

      content = await response.text()
      contentType = format === 'csv' ? 'text/csv' : 'application/zip'
      filename = `${datasetId.split('/').pop()}.${format}`

    } else {
      // For locally stored datasets
      console.log('Fetching local dataset:', datasetId)

      const { data: dataset, error: datasetError } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .eq('user_id', user.id)
        .single()

      if (datasetError || !dataset) {
        console.error('Dataset fetch error:', datasetError)
        throw new Error('Failed to fetch dataset')
      }

      if (!dataset.file_path) {
        throw new Error('Dataset file not found')
      }

      const { data: fileData, error: downloadError } = await supabase.storage
        .from('datasets')
        .download(dataset.file_path)

      if (downloadError) {
        console.error('File download error:', downloadError)
        throw new Error('Failed to download file')
      }

      content = await fileData.text()
      contentType = format === 'csv' ? 'text/csv' : 'application/zip'
      filename = `${dataset.name}.${format}`
    }

    // If ZIP format is requested, create a ZIP file
    if (format === 'zip') {
      const encoder = new TextEncoder()
      const zipData = encoder.encode(content)
      content = String.fromCharCode.apply(null, Array.from(zipData))
    }

    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
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