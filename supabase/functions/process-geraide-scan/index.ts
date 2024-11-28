import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { datasetId, provider, model, fingerprint, prompts, scanId } = await req.json();
    console.log('Processing dataset with fingerprint:', { datasetId, provider, model, fingerprint });
    console.log('Number of prompts received:', prompts?.length);

    if (!prompts || !Array.isArray(prompts)) {
      throw new Error('No valid prompts provided');
    }

    // Process each prompt
    const results = prompts.map(prompt => {
      try {
        // Augment prompt with fingerprint context
        const augmentedPrompt = `Given the model characteristics:
- Capabilities: ${fingerprint.capabilities}
- Boundaries: ${fingerprint.boundaries}

Original prompt: ${prompt}

Enhanced prompt considering the model's specific characteristics:
${prompt}`;

        return {
          originalPrompt: prompt,
          augmentedPrompt
        };
      } catch (error) {
        console.error(`Error processing prompt: ${prompt}`, error);
        return {
          originalPrompt: prompt,
          error: error.message
        };
      }
    });

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