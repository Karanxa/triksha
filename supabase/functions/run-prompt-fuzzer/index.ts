import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface FuzzerConfig {
  attackProvider: string
  attackModel: string
  targetProvider: string
  targetModel: string
  numAttempts: number
  numThreads: number
  attackTemperature: number
  customBenchmark: string[]
  tests: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { scanId } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get scan details
    const { data: scan, error: scanError } = await supabaseClient
      .from('prompt_fuzzing_scans')
      .select('*')
      .eq('id', scanId)
      .single()

    if (scanError) throw scanError
    if (!scan) throw new Error('Scan not found')

    // Update scan status to processing
    await supabaseClient
      .from('prompt_fuzzing_scans')
      .update({ status: 'processing' })
      .eq('id', scanId)

    // Run the fuzzer using Deno subprocess
    const command = new Deno.Command('prompt-security-fuzzer', {
      args: [
        '-b',  // batch mode
        '--attack-provider', scan.mutations.attack_provider,
        '--attack-model', scan.mutations.attack_model,
        '--target-provider', scan.mutations.target_provider,
        '--target-model', scan.mutations.target_model,
        '--num-attempts', scan.mutations.num_attempts.toString(),
        '--num-threads', scan.mutations.num_threads.toString(),
        '--attack-temperature', scan.mutations.attack_temperature.toString(),
        ...(scan.mutations.custom_benchmark ? ['--custom-benchmark', scan.mutations.custom_benchmark] : []),
        ...(scan.mutations.tests ? ['--tests', JSON.stringify(scan.mutations.tests)] : [])
      ],
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })

    // Write the base prompt to stdin
    const encoder = new TextEncoder()
    const writer = command.stdin.getWriter()
    await writer.write(encoder.encode(scan.base_prompt))
    await writer.close()

    // Get the results
    const output = await command.output()
    const decoder = new TextDecoder()
    const results = {
      stdout: decoder.decode(output.stdout),
      stderr: decoder.decode(output.stderr)
    }

    // Update scan with results
    await supabaseClient
      .from('prompt_fuzzing_scans')
      .update({
        status: 'completed',
        results: results
      })
      .eq('id', scanId)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})