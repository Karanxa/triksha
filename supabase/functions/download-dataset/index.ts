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
    const { datasetId, format } = await req.json()
    
    if (!datasetId) {
      throw new Error('Dataset ID is required')
    }

    if (!format || !['csv', 'txt', 'zip'].includes(format)) {
      throw new Error('Invalid format specified')
    }

    // Get user's API keys
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader?.replace('Bearer ', '') ?? ''
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // First check if this is a local dataset
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single()

    if (dataset) {
      // This is a local dataset
      if (!dataset.file_path) {
        throw new Error('Dataset file not found')
      }

      const { data: fileData, error: storageError } = await supabase
        .storage
        .from('datasets')
        .download(dataset.file_path)

      if (storageError) {
        throw new Error('Failed to download dataset file')
      }

      return new Response(fileData, {
        headers: {
          ...corsHeaders,
          'Content-Type': getContentType(format),
          'Content-Disposition': `attachment; filename="${dataset.name}.${format}"`,
        },
      })
    }

    // If not a local dataset, try Hugging Face
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.api_keys?.huggingface) {
      throw new Error('Hugging Face API key not found')
    }

    console.log('Fetching from Hugging Face:', datasetId)
    
    const response = await fetch(`https://huggingface.co/api/datasets/${datasetId}/download`, {
      headers: {
        'Authorization': `Bearer ${profile.api_keys.huggingface}`,
      },
    })

    if (!response.ok) {
      console.error('Hugging Face API error:', response.status, await response.text())
      throw new Error(`Failed to fetch dataset from Hugging Face: ${response.statusText}`)
    }

    const content = await response.blob()
    
    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': getContentType(format),
        'Content-Disposition': `attachment; filename="${datasetId.split('/').pop()}.${format}"`,
      },
    })

  } catch (error) {
    console.error('Download dataset error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function getContentType(format: string): string {
  switch (format) {
    case 'csv':
      return 'text/csv'
    case 'txt':
      return 'text/plain'
    case 'zip':
      return 'application/zip'
    default:
      return 'application/octet-stream'
  }
}