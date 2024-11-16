import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface GarakScanRequest {
  prompt: string;
  model: string;
  tests?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, model, tests } = await req.json() as GarakScanRequest;

    // Make request to local Garak instance
    const garakResponse = await fetch('http://localhost:8080/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify({
        prompt,
        model,
        tests: tests || ['all'], // Run all tests if none specified
      }),
    });

    if (!garakResponse.ok) {
      throw new Error(`Garak API error: ${garakResponse.statusText}`);
    }

    const results = await garakResponse.json();

    return new Response(
      JSON.stringify(results),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    )
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  }
})