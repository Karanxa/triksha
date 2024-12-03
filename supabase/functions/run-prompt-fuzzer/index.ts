import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface FuzzerConfig {
  attack_provider: string
  attack_model: string
  target_provider: string
  target_model: string
  num_attempts: number
  num_threads: number
  attack_temperature: number
  tests?: string[]
  custom_benchmark?: string
  debug_level?: number
}

serve(async (req) => {
  // Handle CORS
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

    // Get user's API keys
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('api_keys')
      .eq('id', scan.user_id)
      .single()

    if (!profile?.api_keys) {
      throw new Error('API keys not configured')
    }

    // Set environment variables for the selected providers
    const apiKeys = profile.api_keys
    const mutations: FuzzerConfig = scan.mutations

    // Set provider API key as environment variable
    switch (mutations.attack_provider) {
      case 'openai':
        Deno.env.set('OPENAI_API_KEY', apiKeys.openai)
        break
      case 'anthropic':
        Deno.env.set('ANTHROPIC_API_KEY', apiKeys.anthropic)
        break
      case 'google':
        Deno.env.set('GOOGLE_API_KEY', apiKeys.gemini)
        break
      // Add other providers as needed
    }

    // Build command arguments
    const args = [
      '-b',  // batch mode
      '--attack-provider', mutations.attack_provider,
      '--attack-model', mutations.attack_model,
      '--target-provider', mutations.target_provider,
      '--target-model', mutations.target_model,
      '--num-attempts', mutations.num_attempts.toString(),
      '--num-threads', mutations.num_threads.toString(),
      '--attack-temperature', mutations.attack_temperature.toString(),
    ]

    // Add optional arguments
    if (mutations.debug_level !== undefined) {
      args.push('--debug-level', mutations.debug_level.toString())
    }

    if (mutations.custom_benchmark) {
      args.push('--custom-benchmark', mutations.custom_benchmark)
    }

    if (mutations.tests && mutations.tests.length > 0) {
      args.push('--tests', JSON.stringify(mutations.tests))
    }

    // Run the fuzzer
    const command = new Deno.Command('prompt-security-fuzzer', {
      args,
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