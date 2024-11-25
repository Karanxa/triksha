import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function validateCustomEndpoint(customEndpoint: any): Promise<boolean> {
  try {
    if (customEndpoint.inputType === 'curl') {
      // For curl requests, we'll use the predefined endpoint
      const requestBody = {
        aegis_payload: {
          input: [{ role: "user", content: "Test validation message" }],
          guardrail_conf: [
            {
              name: "list_checker",
              required: true,
              mandatory_accept: false,
              parameters: "{\"fuzzy\": \"true\"}",
              is_llm: false
            }
          ],
          min_consensus: 1
        },
        llm_payload: {
          model: "SAQ-v7-all-fk-gpt-turbo-v1.5",
          messages: [
            { role: "system", content: "Hello" },
            { role: "user", content: "Test validation message" }
          ],
          max_tokens: 120,
          temperature: 0,
          top_p: 1,
          stop: ["<|eot_id|>"]
        },
        llm_endpoint: "http://saq-v7-fk-gpt-char-fix-modelhost.mlp-h100-modelhost-prod.fkcloud.in/predict"
      };

      const response = await fetch('http://10.83.33.100/fk_jarvis_aegis/v1/evaluate_prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Validation failed with status ${response.status}`);
      }

      const result = await response.json();
      return Boolean(result); // Ensure we got a valid JSON response
    } else {
      // For manual configuration
      const headers = {
        'Content-Type': 'application/json',
        ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {})
      };

      if (customEndpoint.apiKey) {
        headers['Authorization'] = `Bearer ${customEndpoint.apiKey}`;
      }

      const response = await fetch(customEndpoint.url, {
        method: customEndpoint.method || 'POST',
        headers,
        body: JSON.stringify({ prompt: "Test validation message" })
      });

      if (!response.ok) {
        throw new Error(`Validation failed with status ${response.status}`);
      }

      const result = await response.json();
      return Boolean(result); // Ensure we got a valid JSON response
    }
  } catch (error) {
    console.error('Endpoint validation error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { provider, model, prompt, customEndpoint } = await req.json();
    console.log('Fingerprinting request:', { provider, model, prompt, customEndpoint });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) throw new Error('Invalid user token');

    // For validation requests, only check if the endpoint is accessible
    if (prompt === 'Test validation message') {
      if (provider === 'custom' && customEndpoint) {
        const isValid = await validateCustomEndpoint(customEndpoint);
        if (!isValid) {
          throw new Error('Failed to validate custom endpoint');
        }
        return new Response(
          JSON.stringify({ response: 'Endpoint validated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get user's API keys for non-custom providers
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError) throw new Error('Failed to fetch user profile');
    if (!profile?.api_keys) throw new Error('API keys not configured');

    let response;
    if (provider === 'custom' && customEndpoint) {
      // Re-validate endpoint before each request to ensure it's still accessible
      const isValid = await validateCustomEndpoint(customEndpoint);
      if (!isValid) {
        throw new Error('Custom endpoint validation failed');
      }

      if (customEndpoint.inputType === 'curl') {
        // Process curl request
        const requestBody = {
          aegis_payload: {
            input: [{ role: "user", content: prompt }],
            guardrail_conf: [
              {
                name: "list_checker",
                required: true,
                mandatory_accept: false,
                parameters: "{\"fuzzy\": \"true\"}",
                is_llm: false
              }
            ],
            min_consensus: 1
          },
          llm_payload: {
            model: "SAQ-v7-all-fk-gpt-turbo-v1.5",
            messages: [
              { role: "system", content: "Hello" },
              { role: "user", content: prompt }
            ],
            max_tokens: 120,
            temperature: 0,
            top_p: 1,
            stop: ["<|eot_id|>"]
          },
          llm_endpoint: "http://saq-v7-fk-gpt-char-fix-modelhost.mlp-h100-modelhost-prod.fkcloud.in/predict"
        };

        const result = await fetch('http://10.83.33.100/fk_jarvis_aegis/v1/evaluate_prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!result.ok) {
          throw new Error(`Custom endpoint returned status ${result.status}`);
        }

        response = await result.json();
      } else {
        // Process manual configuration
        const headers = {
          'Content-Type': 'application/json',
          ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {})
        };

        if (customEndpoint.apiKey) {
          headers['Authorization'] = `Bearer ${customEndpoint.apiKey}`;
        }

        const result = await fetch(customEndpoint.url, {
          method: customEndpoint.method || 'POST',
          headers,
          body: JSON.stringify({ prompt })
        });

        if (!result.ok) {
          throw new Error(`Custom endpoint returned status ${result.status}`);
        }

        response = await result.json();
      }
    } else {
      // Handle other providers (openai, anthropic, etc.)
      const openaiKey = profile.api_keys.openai;
      if (!openaiKey) throw new Error('OpenAI API key not configured in Settings');
      response = await handleOpenAIRequest(prompt, model, openaiKey);
    }

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in geraide-fingerprint function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
