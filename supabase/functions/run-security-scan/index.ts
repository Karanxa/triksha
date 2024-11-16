import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { exec } from "https://deno.land/x/exec@0.0.5/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompts, provider, model, testSuites = [] } = await req.json();

    if (!scanId || !prompts || !provider) {
      throw new Error('Missing required parameters');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
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

    let command = '';
    let results = null;

    if (provider === 'garak') {
      // Construct Garak command based on model and test suites
      command = `garak run --model ${model} --test-suites ${testSuites.join(',')} --prompts "${prompts.join('\\n')}"`;
      console.log('Running Garak command:', command);
      
      const { stdout } = await exec(command);
      results = stdout;

      // Update scan status in database
      await supabaseClient
        .from('garak_scans')
        .update({
          status: 'completed',
          results: { output: results },
          updated_at: new Date().toISOString()
        })
        .eq('id', scanId);

    } else if (provider === 'prompt-fuzzer') {
      // Construct Prompt Security Fuzzer command
      command = `prompt-security-fuzzer --model ${model} --prompts "${prompts.join('\\n')}"`;
      console.log('Running Prompt Security Fuzzer command:', command);
      
      const { stdout } = await exec(command);
      results = stdout;

      // Update scan status in database
      await supabaseClient
        .from('llm_scans')
        .update({
          status: 'completed',
          results: { output: results },
          updated_at: new Date().toISOString()
        })
        .eq('id', scanId);
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
    console.error('Error in security scan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});