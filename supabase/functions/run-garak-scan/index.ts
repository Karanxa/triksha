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
    console.log('Received Garak scan request:', { scanId, model, test_suites });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update scan status to processing
    console.log('Updating scan status to processing...');
    await supabase
      .from('garak_scans')
      .update({ 
        status: 'processing',
        results: { progress: 0 }
      })
      .eq('id', scanId);

    // Extract model type and name
    const [modelType, modelName] = model.split('/');
    console.log('Extracted model info:', { modelType, modelName });

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

    console.log('Running Garak command:', command.join(' '));

    const process = new Deno.Command("python3", {
      args: command,
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await process.output();
    console.log('Garak process completed with code:', code);
    
    if (code !== 0) {
      const errorMessage = new TextDecoder().decode(stderr);
      console.error('Garak process error:', errorMessage);
      throw new Error(`Garak scan failed: ${errorMessage}`);
    }

    // Read results file
    console.log('Reading results file...');
    const results = await Deno.readTextFile(`/app/garak-results/${scanId}.json`);
    console.log('Results file read successfully');
    
    // Update scan with results
    console.log('Updating scan with results...');
    await supabase
      .from('garak_scans')
      .update({
        status: 'completed',
        results: JSON.parse(results)
      })
      .eq('id', scanId);

    return new Response(
      JSON.stringify({ success: true, results: JSON.parse(results) }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error running Garak scan:', error);
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