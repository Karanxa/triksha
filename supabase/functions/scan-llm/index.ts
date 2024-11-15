import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { handleOllamaRequest } from "./providers/ollama.ts";
import { handleOpenAIRequest } from "./providers/openai.ts";
import { analyzeVulnerability } from "./utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompts, provider, category } = await req.json();
    
    console.log(`Processing scan ${scanId} with provider ${provider}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw userError || new Error('User not found');
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    // Process each prompt
    const results = [];
    for (const prompt of prompts) {
      try {
        let modelResponse;

        if (provider === 'ollama') {
          const ollamaEndpoint = profile?.api_keys?.ollama_endpoint;
          if (!ollamaEndpoint) {
            throw new Error('Ollama endpoint not configured. Please add it in Settings.');
          }
          console.log('Using Ollama endpoint:', ollamaEndpoint);
          modelResponse = await handleOllamaRequest(prompt, ollamaEndpoint);
        } else if (provider === 'openai') {
          const apiKey = profile?.api_keys?.openai;
          if (!apiKey) {
            throw new Error('OpenAI API key not found');
          }
          modelResponse = await handleOpenAIRequest(prompt, apiKey);
        } else {
          throw new Error(`Unsupported provider: ${provider}`);
        }

        // Analyze vulnerability
        const isVulnerable = analyzeVulnerability(category, modelResponse);

        // Update scan record
        const { error: updateError } = await supabaseClient
          .from('llm_scans')
          .update({
            status: 'completed',
            results: {
              prompt: prompt,
              model_response: modelResponse
            },
            is_vulnerable: isVulnerable
          })
          .eq('id', scanId);

        if (updateError) {
          console.error('Error updating scan:', updateError);
          throw new Error('Failed to update scan');
        }

        results.push({
          prompt,
          response: modelResponse,
          isVulnerable
        });
      } catch (error) {
        console.error(`Error processing prompt: ${error}`);
        results.push({
          error: error.message,
          prompt
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in scan-llm function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});