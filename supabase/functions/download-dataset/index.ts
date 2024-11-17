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
    const { data: profile } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    if (!profile?.api_keys?.huggingface) {
      throw new Error('Hugging Face API key not found')
    }

    // For Hugging Face datasets, fetch directly from their API
    if (datasetId.includes('/')) {
      console.log('Fetching Hugging Face dataset:', datasetId)
      
      const response = await fetch(`https://huggingface.co/api/datasets/${datasetId}/parquet`, {
        headers: {
          'Authorization': `Bearer ${profile.api_keys.huggingface}`,
          'Accept': 'application/octet-stream'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch dataset from Hugging Face: ${response.statusText}`)
      }

      const content = await response.text()
      
      // Convert to requested format
      let formattedContent = content
      let contentType = 'text/csv'
      
      if (format === 'zip') {
        // If zip format requested, we'll need to create a zip file
        const encoder = new TextEncoder()
        const zipData = encoder.encode(content)
        contentType = 'application/zip'
        formattedContent = String.fromCharCode.apply(null, Array.from(zipData))
      }

      return new Response(formattedContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${datasetId.split('/').pop()}.${format}"`,
        },
      })
    } else {
      // For locally stored datasets, fetch from Supabase storage
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

      const content = await fileData.text()
      let contentType = format === 'csv' ? 'text/csv' : 'application/zip'

      return new Response(content, {
        headers: {
          ...corsHeaders,
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${dataset.name}.${format}"`,
        },
      })
    }
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