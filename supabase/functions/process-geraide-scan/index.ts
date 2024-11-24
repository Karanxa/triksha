import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { datasetId, provider, model, fingerprint } = await req.json();
    console.log('Processing dataset:', { datasetId, provider, model });

    // Get the dataset content
    const { data: dataset, error: datasetError } = await supabaseClient
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (datasetError) throw new Error(`Failed to fetch dataset: ${datasetError.message}`);

    // Download and process the dataset file
    const { data: fileData, error: fileError } = await supabaseClient.storage
      .from('datasets')
      .download(dataset.file_path);

    if (fileError) throw new Error(`Failed to download dataset file: ${fileError.message}`);

    // Process the file content
    const text = await fileData.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].toLowerCase().split(',');
    const promptIndex = headers.findIndex(h => h.includes('prompt'));
    
    if (promptIndex === -1) {
      throw new Error('No prompt column found in dataset');
    }

    // Process each prompt with the fingerprint
    const prompts = lines.slice(1).map(line => {
      const values = line.split(',');
      return values[promptIndex]?.trim() || '';
    }).filter(Boolean);

    // Store analysis results
    const results = {
      processedPrompts: prompts.length,
      fingerprint,
      timestamp: new Date().toISOString(),
      summary: `Processed ${prompts.length} prompts with model ${model}`
    };

    await supabaseClient
      .from('datasets')
      .update({
        metadata: {
          lastAnalysis: results
        }
      })
      .eq('id', datasetId);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing Geraide scan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});