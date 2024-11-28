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
    console.log('Processing dataset:', { datasetId, provider, model });

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
    
    if (lines.length === 0) {
      throw new Error('Dataset is empty');
    }

    // Find the prompt column
    const headers = lines[0].toLowerCase().split(',').map(header => header.trim());
    const promptIndex = headers.findIndex(header => 
      header === 'prompts' || header === 'prompt' || header === 'text' || header === 'original_prompt'
    );

    if (promptIndex === -1) {
      throw new Error('No prompt column found in dataset. Column must be named "prompt", "prompts", "text", or "original_prompt"');
    }

    // Extract prompts from CSV, properly handling quoted values
    const prompts = lines.slice(1).map(line => {
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const cleanedValues = values.map(val => val.replace(/^"|"$/g, '').trim());
      return cleanedValues[promptIndex];
    }).filter(Boolean);

    if (prompts.length === 0) {
      throw new Error('No valid prompts found in dataset');
    }

    console.log(`Found ${prompts.length} prompts to process`);

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

        // Process with model
        const { data: response, error: modelError } = await supabaseClient.functions.invoke('geraide-fingerprint', {
          body: {
            provider,
            model,
            prompt: augmentedPrompt,
            customEndpoint
          }
        });

        if (modelError) throw modelError;

        results.push({
          originalPrompt: prompt,
          augmentedPrompt,
          modelResponse: response.response
        });

        processedCount++;
        console.log(`Processed ${processedCount}/${prompts.length} prompts`);

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

    // Save the augmented dataset
    const augmentedDatasetName = `${dataset.name}_augmented`;
    const csvContent = 'original_prompt,augmented_prompt,model_response\n' +
      results.map(r => 
        `"${r.originalPrompt.replace(/"/g, '""')}","${(r.augmentedPrompt || '').replace(/"/g, '""')}","${(r.modelResponse || r.error || '').replace(/"/g, '""')}"`
      ).join('\n');

    const timestamp = new Date().getTime();
    const filePath = `augmented/${timestamp}_${augmentedDatasetName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;

    const { error: uploadError } = await supabaseClient.storage
      .from('datasets')
      .upload(filePath, csvContent, {
        contentType: 'text/csv',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Create new dataset record for augmented dataset
    const { error: insertError } = await supabaseClient
      .from('datasets')
      .insert({
        name: augmentedDatasetName,
        description: `Augmented version of ${dataset.name} using ${model} fingerprint`,
        file_path: filePath,
        user_id: dataset.user_id,
        category: 'augmented',
        metadata: {
          original_dataset_id: dataset.id,
          fingerprint_results: fingerprint,
          model,
          provider
        }
      });

    if (insertError) throw insertError;

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