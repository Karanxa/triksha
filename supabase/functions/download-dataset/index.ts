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

    if (datasetError) {
      console.error('Error fetching dataset:', datasetError)
      throw new Error('Failed to fetch dataset')
    }

    if (!dataset) {
      throw new Error('Dataset not found')
    }

    if (!dataset.file_path) {
      throw new Error('Dataset file not found')
    }

    console.log('Fetching dataset file:', dataset.file_path)

    const { data: fileData, error: storageError } = await supabase
      .storage
      .from('datasets')
      .download(dataset.file_path)

    if (storageError) {
      console.error('Storage error:', storageError)
      throw new Error('Failed to download dataset file')
    }

    if (!fileData) {
      throw new Error('No file data received')
    }

    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        'Content-Type': getContentType(format),
        'Content-Disposition': `attachment; filename="${dataset.name}.${format}"`,
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