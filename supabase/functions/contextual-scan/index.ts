import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, provider, prompts } = await req.json();
    console.log("Received scan request:", { scanId, provider, prompts });

    if (!scanId || !provider || !prompts) {
      throw new Error("Missing required parameters");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Simulate fingerprinting process with messages
    const messages = [];
    
    // System introduction
    messages.push({
      role: 'assistant',
      content: "Starting contextual scan and model fingerprinting..."
    });

    // Process each fingerprinting question
    for (const prompt of prompts) {
      // Add user message
      messages.push({
        role: 'user',
        content: prompt
      });

      // Simulate model response
      messages.push({
        role: 'assistant',
        content: `Analyzing prompt: "${prompt}"\nChecking for potential vulnerabilities...`
      });

      // Update scan with new messages
      const { error: updateError } = await supabase
        .from('contextual_scans')
        .update({ messages })
        .eq('id', scanId);

      if (updateError) {
        throw updateError;
      }

      // Add delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Final message
    messages.push({
      role: 'assistant',
      content: "Scan completed. Analysis results have been recorded."
    });

    // Update final results
    const { error: finalError } = await supabase
      .from('contextual_scans')
      .update({
        messages,
        is_vulnerable: false,
        fingerprint_results: {
          completed: true,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', scanId);

    if (finalError) {
      throw finalError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});