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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) throw new Error('Unauthorized');

    // Get user's API keys
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError) throw new Error('Failed to fetch user profile');
    if (!profile?.api_keys?.openai) throw new Error('OpenAI API key not configured in Settings');

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

    // Extract prompts
    const prompts = lines.slice(1).map(line => {
      const values = line.split(',');
      return values[promptIndex]?.trim() || '';
    }).filter(Boolean);

    // Augment prompts using fingerprint
    const augmentedPrompts = prompts.map(prompt => {
      const context = [
        fingerprint.capabilities && `Model capabilities: ${fingerprint.capabilities}`,
        fingerprint.boundaries && `Security boundaries: ${fingerprint.boundaries}`,
        fingerprint.safety && `Safety measures: ${fingerprint.safety}`
      ].filter(Boolean).join('\n');

      return `Given the following model characteristics:\n${context}\n\nOriginal prompt:\n${prompt}`;
    });

    // Test augmented prompts with the model
    const modelResponses = [];
    
    for (const prompt of augmentedPrompts) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${profile.api_keys.openai}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${await response.text()}`);
        }

        const data = await response.json();
        modelResponses.push(data.choices[0].message.content);
      } catch (error) {
        console.error('Error testing prompt:', error);
        modelResponses.push(`Error: ${error.message}`);
      }

      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return new Response(
      JSON.stringify({ 
        augmentedPrompts,
        modelResponses
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