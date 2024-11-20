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
    const { scanId, model, test_suites } = await req.json();
    console.log("Starting Garak scan:", { scanId, model, test_suites });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update scan status to processing
    await supabase
      .from('garak_scans')
      .update({ 
        status: 'processing',
        results: { progress: 0 }
      })
      .eq('id', scanId);

    // Extract model type and name
    const [modelType, modelName] = model.split('/');
    console.log("Processing scan with model:", { modelType, modelName });

    // Build Garak command
    const command = new Deno.Command("python3", {
      args: [
        "-m",
        "garak",
        "--model_type", modelType,
        "--model_name", modelName,
        "--probes", test_suites.join(','),
        "--output_format", "json",
        "--output", `/app/garak-results/${scanId}.json`
      ],
      stdout: "piped",
      stderr: "piped",
    });

    // Run Garak scan
    console.log("Executing Garak command...");
    const { code, stdout, stderr } = await command.output();
    
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

    // Read and parse results
    console.log("Reading results file...");
    const results = await Deno.readTextFile(`/app/garak-results/${scanId}.json`);
    
    // Update scan with results
    await supabase
      .from('garak_scans')
      .update({
        status: 'completed',
        results: JSON.parse(results)
      })
      .eq('id', scanId);

    console.log("Scan completed successfully");
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});