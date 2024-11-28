import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { augmentPrompt } from "./promptAugmenter.ts";
import { testWithModel } from "./modelTester.ts";
import { ProcessedResult, FingerPrintResult } from "./types.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) throw new Error('Unauthorized');

    // Get request data
    const { datasetId, provider, model, fingerprint } = await req.json();
    console.log('Processing dataset:', { datasetId, provider, model });

    // Get user's API key
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (!profile?.api_keys?.openai) {
      throw new Error('OpenAI API key not found. Please add it in the Keys tab.');
    }

    // Get dataset content
    const { data: dataset } = await supabaseClient
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single();

    if (!dataset) throw new Error('Dataset not found');

    // Download and parse CSV
    const { data: fileData } = await supabaseClient.storage
      .from('datasets')
      .download(dataset.file_path);

    const text = await fileData.text();
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    if (lines.length === 0) throw new Error('Dataset is empty');

    // Find prompt column
    const headers = lines[0].toLowerCase().split(',');
    const promptIndex = headers.findIndex(header => 
      header === 'prompts' || header === 'prompt' || header === 'text' || header === 'original_prompt'
    );

    if (promptIndex === -1) throw new Error('No prompt column found in dataset');

    // Extract and process prompts
    const prompts = lines.slice(1)
      .map(line => {
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        return values[promptIndex]?.replace(/^"|"$/g, '').trim();
      })
      .filter(Boolean);

    console.log(`Processing ${prompts.length} prompts`);
    const results: ProcessedResult[] = [];

    // Process each prompt
    for (const prompt of prompts) {
      try {
        // Augment prompt using fingerprint context
        const augmentedPrompt = await augmentPrompt(
          prompt,
          fingerprint as FingerPrintResult,
          profile.api_keys.openai
        );

        // Test with target model
        const modelResponse = await testWithModel(
          augmentedPrompt,
          provider,
          model,
          profile.api_keys[provider] || profile.api_keys.openai
        );

        results.push({
          originalPrompt: prompt,
          augmentedPrompt,
          modelResponse
        });

        console.log('Processed prompt:', { original: prompt, augmented: augmentedPrompt });
      } catch (error) {
        console.error('Error processing prompt:', error);
        results.push({
          originalPrompt: prompt,
          augmentedPrompt: prompt,
          modelResponse: `Error: ${error.message}`
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        processedPrompts: results.length,
        totalPrompts: prompts.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-geraide-scan:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 200, // Send 200 even for errors to handle them gracefully in frontend
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});