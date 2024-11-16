import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityFuzzerRequest {
  prompt: string;
  attackProvider: string;
  attackModel: string;
  targetProvider: string;
  targetModel: string;
  numAttempts: number;
  numThreads: number;
  attackTemperature: number;
  customBenchmark: string[];
  tests: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user's ID from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get the user's OpenAI API key from their profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.api_keys?.openai) {
      throw new Error('OpenAI API key not found in profile');
    }

    const {
      prompt,
      attackProvider,
      attackModel,
      targetProvider,
      targetModel,
      numAttempts,
      numThreads,
      attackTemperature,
      customBenchmark,
      tests
    } = await req.json() as SecurityFuzzerRequest;

    console.log(`Starting prompt security fuzzing with configuration:
      Attack Provider: ${attackProvider}
      Attack Model: ${attackModel}
      Target Provider: ${targetProvider}
      Target Model: ${targetModel}
      Attempts: ${numAttempts}
      Threads: ${numThreads}
      Temperature: ${attackTemperature}
    `);

    // Here we'll simulate the fuzzing process with the provided configuration
    // In a real implementation, you would use the OpenAI API key from profile.api_keys.openai
    // to make actual API calls to the selected providers
    const results = {
      configuration: {
        attack_provider: attackProvider,
        attack_model: attackModel,
        target_provider: targetProvider,
        target_model: targetModel,
        num_attempts: numAttempts,
        num_threads: numThreads,
        attack_temperature: attackTemperature,
        custom_benchmark: customBenchmark,
        tests: tests
      },
      results: [],
      summary: {
        total_attempts: numAttempts,
        successful_attacks: 0,
        failed_attacks: numAttempts,
        average_response_time: 0
      }
    };

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in prompt-security-fuzzer function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});