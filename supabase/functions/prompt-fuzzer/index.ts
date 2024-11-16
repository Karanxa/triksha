import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface FuzzerRequest {
  prompt: string;
  numMutations: number;
  strategy: string;
  model: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, numMutations, strategy, model } = await req.json() as FuzzerRequest;

    console.log(`Starting prompt fuzzing with ${numMutations} mutations`);

    // Create a process to run the prompt-fuzzer CLI
    const command = new Deno.Command("prompt-fuzzer", {
      args: [
        "fuzz",
        "--prompt", prompt,
        "--mutations", numMutations.toString(),
        "--strategy", strategy,
        "--model", model,
        "--output", "json"
      ],
    });

    const { stdout, stderr } = await command.output();
    
    if (stderr.length > 0) {
      const errorText = new TextDecoder().decode(stderr);
      console.error("Prompt fuzzer error:", errorText);
      throw new Error(errorText);
    }

    const output = new TextDecoder().decode(stdout);
    const results = JSON.parse(output);

    console.log(`Fuzzing completed with ${results.mutations.length} mutations generated`);

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