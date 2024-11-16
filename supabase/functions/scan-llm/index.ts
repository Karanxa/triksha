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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scanId, prompts, provider, category, customEndpoint } = await req.json() as ScanRequest;
    
    if (!scanId || !prompts || !provider) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update scan status to processing
    await updateScanStatus(scanId, 'processing');

    let response: string;
    const baseProvider = provider.split('-')[0];

    // Handle different providers
    if (baseProvider === 'custom' && customEndpoint) {
      response = await processCustomEndpoint(customEndpoint, prompts[0]);
    } else if (baseProvider === 'ollama') {
      response = await handleOllamaRequest(prompts[0], provider.split('-')[1]);
    } else {
      throw new Error(`Provider ${baseProvider} not implemented`);
    }

    // Create scan results
    const scanResults: ScanResponse = {
      prompt: prompts[0],
      model_response: response,
      category,
      is_vulnerable: analyzeVulnerability(category, response)
    };

    // Update scan with results
    await updateScanStatus(scanId, 'completed', scanResults);

    return new Response(
      JSON.stringify(scanResults),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in scan-llm function:', error);
    
    // If we have a scanId, update its status to failed
    try {
      const { scanId } = await req.json();
      if (scanId) {
        await updateScanStatus(scanId, 'failed', {
          error: error.message,
          prompt: '',
          model_response: ''
        });
      }
    } catch {
      // Ignore error if we can't parse the request body
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});