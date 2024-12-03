import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateAdversarialPrompts } from './adversarialGenerator.ts'
import { enhanceWithOpenAI } from './openaiEnhancer.ts'
import { generateRecipePrompts } from './recipeGenerator.ts'
import { enhanceRecipePrompts } from './recipeEnhancer.ts'

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
    if (!name) {
      throw new Error('Dataset name is required')
    }

    if (method === "manual" && !basePrompt) {
      throw new Error('Base prompt is required for manual method')
    }

    if (method === "recipe" && (!recipe || !targetModel)) {
      throw new Error('Recipe and target model are required for recipe method')
    }

    if (method === "adversarial" && !adversarialConfig) {
      throw new Error('Adversarial config is required for adversarial method')
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
    let prompts: string[] = []
    let enhancedPrompts: string[] = []
    let fileContent = ''
    
    if (method === 'recipe') {
      metadata = {
        recipe,
        targetModel,
        numSamples
      }
      // Generate base recipe prompts
      prompts = await generateRecipePrompts({ recipe, targetModel, numSamples })
      
      // Get user's OpenAI API key for enhancement
      const { data: profile } = await supabase
        .from('profiles')
        .select('api_keys')
        .eq('id', user.id)
        .single()

      if (profile?.api_keys?.openai) {
        // Enhance the prompts and store both versions
        enhancedPrompts = await enhanceRecipePrompts(prompts, { recipe, targetModel, numSamples }, profile.api_keys.openai)
      }
    } else if (method === 'adversarial') {
      prompts = await generateAdversarialPrompts(adversarialConfig, numSamples)
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('api_keys')
        .eq('id', user.id)
        .single()

      if (profile?.api_keys?.openai) {
        // Enhance the prompts and store both versions
        enhancedPrompts = await enhanceWithOpenAI(prompts, adversarialConfig, profile.api_keys.openai)
      }
      
      metadata = {
        ...adversarialConfig,
        numSamples
      }
    } else {
      metadata = {
        basePrompt,
        numSamples
      }
      prompts = [basePrompt]
    }

    // Create CSV content with prompts
    fileContent = 'original_prompt,prompt,category,method\n'
    prompts.forEach((prompt, index) => {
      if (prompt) {
        const escapedPrompt = prompt.replace(/"/g, '""')
        const enhancedPrompt = enhancedPrompts[index] ? enhancedPrompts[index].replace(/"/g, '""') : ''
        fileContent += `"${escapedPrompt}","${enhancedPrompt}",${method},${method === 'recipe' ? recipe : method === 'adversarial' ? adversarialConfig.attackType : 'manual'}\n`
      }
    })

    // Generate unique filename using a sanitized version of the name
    const timestamp = new Date().getTime()
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const filePath = `${user.id}/${timestamp}_${sanitizedName}.csv`

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('datasets')
      .upload(filePath, fileContent, {
        contentType: 'text/csv',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Failed to upload dataset: ${uploadError.message}`)
    }

    // Create dataset record
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .insert({
        name,
        description,
        user_id: user.id,
        file_path: filePath,
        category: method === 'recipe' ? 'easyjailbreak' : method === 'adversarial' ? 'adversarial' : 'manual',
        metadata
      })
      .select()
      .single()

    if (datasetError) {
      throw new Error('Failed to create dataset record')
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
