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

    const { datasetId, provider, model, fingerprint, customEndpoint } = await req.json();
    console.log('Processing dataset with fingerprint:', { datasetId, provider, model, fingerprint });

    // Get the dataset content
    const { data: dataset, error: datasetError } = await supabaseClient
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (datasetError) throw new Error(`Failed to fetch dataset: ${datasetError.message}`);

    // Download the dataset file
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('datasets')
      .download(dataset.file_path);

    if (downloadError) throw new Error(`Failed to download dataset: ${downloadError.message}`);

    // Parse CSV content
    const text = await fileData.text();
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const prompts = lines.slice(1); // Skip header row

    // Process each prompt with the model
    const results = [];
    let processedCount = 0;

    for (const prompt of prompts) {
      try {
        // Augment prompt with fingerprint context
        const augmentedPrompt = `Given the model characteristics:
- Capabilities: ${fingerprint.capabilities}
- Boundaries: ${fingerprint.boundaries}
- Safety: ${fingerprint.safety}

Original prompt: ${prompt}

Enhanced prompt considering the model's specific characteristics:
${prompt}`;

        // Process with model using geraide-fingerprint function
        const { data: response, error: modelError } = await supabaseClient.functions.invoke('geraide-fingerprint', {
          body: {
            provider,
            model,
            prompt: augmentedPrompt,
            customEndpoint
          }
        });

        if (modelError) throw modelError;

        console.log('Model response received:', response);

        results.push({
          originalPrompt: prompt,
          augmentedPrompt,
          modelResponse: response.response
        });

        processedCount++;
        
        // Update progress every 10 prompts
        if (processedCount % 10 === 0) {
          console.log(`Processed ${processedCount}/${prompts.length} prompts`);
        }

      } catch (error) {
        console.error(`Error processing prompt: ${prompt}`, error);
        results.push({
          originalPrompt: prompt,
          error: error.message
        });
      }

      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        processedPrompts: processedCount,
        totalPrompts: prompts.length
      }),
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