import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface GarakScanRequest {
  scanId: string;
  prompts: string[];
  model: string;
  tests: string[];
  config: {
    parallel: boolean;
    batchSize: number;
    rateLimit: number;
    maxRetries: number;
    timeout: number;
  };
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const processBatch = async (
  prompts: string[],
  model: string,
  tests: string[],
  config: GarakScanRequest['config']
) => {
  const results = [];
  const delayBetweenRequests = (60 * 1000) / config.rateLimit;

  for (const prompt of prompts) {
    let retries = 0;
    let success = false;

    while (retries <= config.maxRetries && !success) {
      try {
        const response = await fetch('http://localhost:8080/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            model,
            tests,
          }),
        });

        if (!response.ok) {
          throw new Error(`Garak API error: ${response.statusText}`);
        }

        const result = await response.json();
        results.push({ prompt, result });
        success = true;

        // Rate limiting delay
        await sleep(delayBetweenRequests);
      } catch (error) {
        console.error(`Attempt ${retries + 1} failed:`, error);
        retries++;
        if (retries <= config.maxRetries) {
          // Exponential backoff
          await sleep(Math.pow(2, retries) * 1000);
        }
      }
    }

    if (!success) {
      results.push({ prompt, error: `Failed after ${config.maxRetries} retries` });
    }
  }

  return results;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { scanId, prompts, model, tests, config } = await req.json() as GarakScanRequest;

    console.log(`Starting scan ${scanId} with ${prompts.length} prompts`);

    // Split prompts into batches
    const batches: string[][] = [];
    for (let i = 0; i < prompts.length; i += config.batchSize) {
      batches.push(prompts.slice(i, i + config.batchSize));
    }

    console.log(`Split into ${batches.length} batches of size ${config.batchSize}`);

    let allResults = [];
    if (config.parallel) {
      // Process batches in parallel with concurrency limit
      const concurrencyLimit = Math.min(5, batches.length);
      for (let i = 0; i < batches.length; i += concurrencyLimit) {
        const batchPromises = batches
          .slice(i, i + concurrencyLimit)
          .map(batch => processBatch(batch, model, tests, config));
        
        const batchResults = await Promise.all(batchPromises);
        allResults = allResults.concat(...batchResults);
      }
    } else {
      // Process batches sequentially
      for (const batch of batches) {
        const results = await processBatch(batch, model, tests, config);
        allResults = allResults.concat(results);
      }
    }

    console.log(`Scan ${scanId} completed with ${allResults.length} results`);

    return new Response(
      JSON.stringify(allResults),
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