import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import { processCustomEndpoint } from "./providers/customEndpoint.ts";
import { updateScanStatus } from "./db.ts";
import { analyzeVulnerability } from "./utils.ts";
import { ScanRequest, ScanResponse } from "./types.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const body = await req.json();
    const { scanId, prompts, provider, category, customEndpoint } = body as ScanRequest;
    
    console.log(`Starting scan ${scanId} with prompts:`, prompts);

    // Validate required parameters
    if (!scanId || !prompts || !provider) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          details: { scanId, prompts: !!prompts, provider }
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update scan status to processing
    try {
      await updateScanStatus(scanId, 'processing');
    } catch (error) {
      console.error('Error updating scan status:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update scan status',
          details: error.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    let scanResults: ScanResponse;
    const baseProvider = provider.split('-')[0];

    try {
      if (baseProvider === 'custom' && customEndpoint) {
        console.log('Processing custom endpoint request...');
        const response = await processCustomEndpoint(
          customEndpoint,
          prompts[0]
        );
        scanResults = {
          prompt: prompts[0],
          model_response: response
        };
      } else if (baseProvider === 'ollama') {
        console.log('Processing Ollama request...');
        const modelResponse = await handleOllamaRequest(prompts[0], provider.split('-')[1]);
        scanResults = {
          prompt: prompts[0],
          model_response: modelResponse
        };
      } else {
        throw new Error(`Provider ${baseProvider} not implemented`);
      }

      // Add metadata to results
      scanResults.category = category;
      scanResults.is_vulnerable = analyzeVulnerability(category, scanResults.model_response);

      console.log(`Storing results for scan ${scanId}:`, scanResults);

      // Update scan with results and mark as completed
      await updateScanStatus(scanId, 'completed', scanResults);

      return new Response(
        JSON.stringify(scanResults),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (error) {
      console.error(`Error processing scan ${scanId}:`, error);
      
      // Update scan status to failed
      await updateScanStatus(scanId, 'failed', { 
        prompt: prompts[0],
        model_response: '',
        error: error.message 
      });

      return new Response(
        JSON.stringify({ 
          error: 'Scan processing failed',
          details: error.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error in scan-llm function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});