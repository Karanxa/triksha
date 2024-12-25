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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's dataset
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select('file_path')
      .eq('id', datasetId)
      .single()

    if (datasetError || !dataset?.file_path) {
      console.error('Dataset error:', datasetError)
      throw new Error('Dataset not found')
    }

    // Download file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('datasets')
      .download(dataset.file_path)

    if (downloadError) {
      console.error('Storage download error:', downloadError)
      throw new Error('Failed to download dataset file')
    }

    const content = await fileData.text()

    // If ZIP format is requested, create a ZIP file
    if (format === 'zip') {
      const zipResponse = new Response(content, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${datasetId}.zip"`,
        },
      })
      return zipResponse
    }

    // Default to CSV format
    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${datasetId}.csv"`,
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