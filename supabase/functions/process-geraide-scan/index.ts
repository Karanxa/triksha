import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
      throw new Error('No prompt column found in dataset');
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

    // Process each prompt with OpenAI for augmentation
    const results = [];
    let processedCount = 0;

    const systemPrompt = `Given the following model characteristics:
- Capabilities: ${fingerprint.capabilities}
- Boundaries: ${fingerprint.boundaries}
- Safety: ${fingerprint.safety}

Your task is to enhance each prompt to better interact with or test the model while considering its specific characteristics.
Return only the enhanced prompt without explanations.`;

    for (const prompt of prompts) {
      try {
        // First augment the prompt using OpenAI
        const augmentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!augmentResponse.ok) {
          throw new Error(`OpenAI API error: ${await augmentResponse.text()}`);
        }

        const augmentData = await augmentResponse.json();
        const augmentedPrompt = augmentData.choices[0].message.content;

        // Then test with target model
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