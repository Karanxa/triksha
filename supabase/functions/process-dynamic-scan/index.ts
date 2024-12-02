import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { provider, model, prompt, customEndpoint } = await req.json()
    console.log('Processing dynamic scan:', { provider, model, prompt })

    let response
    if (provider === 'openai') {
      const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openAIApiKey) throw new Error('OpenAI API key not configured')

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: prompt }
          ],
        }),
      })

      const data = await openaiResponse.json()
      response = data.choices[0].message.content
    } else if (provider === 'anthropic') {
      const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
      if (!anthropicApiKey) throw new Error('Anthropic API key not configured')

      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        }),
      })

      const data = await anthropicResponse.json()
      response = data.content[0].text
    } else if (provider === 'custom' && customEndpoint) {
      const customResponse = await fetch(customEndpoint.url, {
        method: customEndpoint.method,
        headers: JSON.parse(customEndpoint.headers || '{}'),
        body: JSON.stringify({ prompt: prompt }),
      })

      const data = await customResponse.json()
      response = data.response || data.text || JSON.stringify(data)
    } else {
      throw new Error('Unsupported provider')
    }

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in dynamic scan:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})