import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateAdversarialPrompts } from './adversarialGenerator.ts'
import { enhanceWithOpenAI } from './openaiEnhancer.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { name, description, basePrompt, numSamples, method, recipe, targetModel, adversarialConfig } = await req.json()

    // Validate input
    if (!name || (method === "manual" && !basePrompt) || 
        (method === "recipe" && !recipe) ||
        (method === "adversarial" && !adversarialConfig)) {
      throw new Error('Missing required fields')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw userError || new Error('User not found')
    }

    let metadata = {}
    let prompts = []
    
    if (method === 'recipe') {
      metadata = {
        recipe,
        targetModel,
        numSamples
      }
    } else if (method === 'adversarial') {
      // Generate base adversarial prompts
      prompts = await generateAdversarialPrompts(adversarialConfig, numSamples)
      
      // Enhance prompts using OpenAI
      const enhancedPrompts = await enhanceWithOpenAI(prompts, adversarialConfig)
      
      metadata = {
        ...adversarialConfig,
        prompts: enhancedPrompts,
        numSamples
      }
    } else {
      metadata = {
        basePrompt,
        numSamples
      }
    }

    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .insert({
        name,
        description,
        user_id: user.id,
        category: method === 'recipe' ? 'easyjailbreak' : method === 'adversarial' ? 'adversarial' : 'manual',
        metadata
      })
      .select()
      .single()

    if (datasetError) {
      throw new Error('Failed to create dataset')
    }

    return new Response(
      JSON.stringify({ success: true, dataset }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-dataset function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})