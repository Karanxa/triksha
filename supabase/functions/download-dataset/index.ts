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
    
    // Get user's Hugging Face API key
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.api_keys?.huggingface) {
      throw new Error('Hugging Face API key not found')
    }

    // Fetch dataset content from Hugging Face
    const response = await fetch(`https://huggingface.co/api/datasets/${datasetId}/download`, {
      headers: {
        'Authorization': `Bearer ${profile.api_keys.huggingface}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch dataset')
    }

    const content = await response.blob()
    
    // Convert content based on requested format
    let formattedContent: Blob
    let filename: string
    
    switch (format) {
      case 'csv':
        formattedContent = new Blob([content], { type: 'text/csv' })
        filename = `dataset.csv`
        break
      case 'txt':
        formattedContent = new Blob([content], { type: 'text/plain' })
        filename = `dataset.txt`
        break
      case 'zip':
        formattedContent = new Blob([content], { type: 'application/zip' })
        filename = `dataset.zip`
        break
      default:
        throw new Error('Unsupported format')
    }

    return new Response(formattedContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': formattedContent.type,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})