import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Edge Function started");
    
    const requestData = await req.json();
    console.log("Received request data:", requestData);
    
    const { scanId, model, test_suites } = requestData;

    if (!scanId || !model || !test_suites?.length) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    console.log("Initializing Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update scan status to processing
    console.log("Updating scan status to processing...");
    const { error: updateError } = await supabase
      .from('garak_scans')
      .update({ 
        status: 'processing',
        results: { progress: 0 }
      })
      .eq('id', scanId);

    if (updateError) {
      console.error("Error updating scan status:", updateError);
      throw new Error(`Failed to update scan status: ${updateError.message}`);
    }

    // Extract model type and name
    const [modelType, modelName] = model.split('/');
    console.log("Processing scan with model:", { modelType, modelName });

    if (!modelType || !modelName) {
      throw new Error('Invalid model format');
    }

    // Build Garak command
    const command = [
      "python3",
      "-m",
      "garak",
      "--model_type", modelType,
      "--model_name", modelName,
      "--probes", test_suites.join(','),
      "--output_format", "json",
      "--output", `/app/garak-results/${scanId}.json`
    ];

    console.log("Executing Garak command:", command.join(' '));

    const process = new Deno.Command("python3", {
      args: command,
      stdout: "piped",
      stderr: "piped",
    });

    console.log("Waiting for Garak process to complete...");
    const { code, stdout, stderr } = await process.output();
    console.log("Garak process completed with code:", code);
    
    if (code !== 0) {
      const errorMessage = new TextDecoder().decode(stderr);
      console.error("Garak process error:", errorMessage);
      
      await supabase
        .from('garak_scans')
        .update({
          status: 'failed',
          results: { error: errorMessage }
        })
        .eq('id', scanId);
        
      throw new Error(`Garak scan failed: ${errorMessage}`);
    }

    // Read results file
    console.log("Reading results file...");
    const results = await Deno.readTextFile(`/app/garak-results/${scanId}.json`);
    console.log("Results file read successfully");
    
    // Update scan with results
    console.log("Updating scan with results...");
    const { error: resultsError } = await supabase
      .from('garak_scans')
      .update({
        status: 'completed',
        results: JSON.parse(results)
      })
      .eq('id', scanId);

    if (resultsError) {
      console.error("Error updating scan results:", resultsError);
      throw new Error(`Failed to update scan results: ${resultsError.message}`);
    }

    console.log("Scan completed successfully");
    return new Response(
      JSON.stringify({ success: true, results: JSON.parse(results) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});