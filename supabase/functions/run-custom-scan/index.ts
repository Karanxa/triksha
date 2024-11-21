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
    const { scanId, model, testIds } = await req.json();
    console.log("Starting custom scan:", { scanId, model, testIds });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get test cases
    const { data: testCases, error: testError } = await supabase
      .from('custom_scan_tests')
      .select('*')
      .in('id', testIds);

    if (testError) throw testError;
    if (!testCases?.length) throw new Error("No test cases found");

    // Update scan status to processing
    await supabase
      .from('custom_scan_executions')
      .update({ 
        status: 'processing',
        results: { progress: 0 }
      })
      .eq('id', scanId);

    // Extract model type and name
    const [modelType, modelName] = model.split('/');
    console.log("Processing scan with model:", { modelType, modelName });

    // Process each test case
    const results = [];
    let processedCount = 0;

    for (const test of testCases) {
      try {
        console.log(`Processing test case: ${test.name}`);
        
        // TODO: Implement actual model API calls based on modelType
        // This is a placeholder for demonstration
        const response = {
          prompt: test.test_prompt,
          response: "Model response would go here",
          passed: true,
          details: "Test execution details"
        };
        
        results.push({
          testId: test.id,
          testName: test.name,
          category: test.category,
          ...response
        });

        processedCount++;
        const progress = Math.round((processedCount / testCases.length) * 100);
        
        // Update scan progress
        await supabase
          .from('custom_scan_executions')
          .update({
            results: {
              progress,
              completed: results
            }
          })
          .eq('id', scanId);

      } catch (error) {
        console.error(`Error processing test case ${test.name}:`, error);
        results.push({
          testId: test.id,
          testName: test.name,
          category: test.category,
          error: error.message
        });
      }
    }

    // Update final scan status
    await supabase
      .from('custom_scan_executions')
      .update({
        status: 'completed',
        results: {
          progress: 100,
          completed: results
        }
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