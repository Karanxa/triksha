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
    
    if (!datasetId) {
      throw new Error('Dataset ID is required')
    }

    // Initialize Supabase client with service role key
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

    console.log('Fetching dataset:', datasetId, 'for user:', user.id)

    // Fetch dataset details
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

    console.log('Downloading file:', dataset.file_path)

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('datasets')
      .download(dataset.file_path)

    if (downloadError) {
      console.error('File download error:', downloadError)
      throw new Error('Failed to download file')
    }

    const content = await fileData.text()
    let contentType: string
    let filename = dataset.name

    switch (format) {
      case 'csv':
        contentType = 'text/csv'
        filename = `${filename}.csv`
        break
      case 'txt':
        contentType = 'text/plain'
        filename = `${filename}.txt`
        break
      case 'zip':
        contentType = 'application/zip'
        filename = `${filename}.zip`
        break
      default:
        contentType = 'text/plain'
        filename = `${filename}.txt`
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