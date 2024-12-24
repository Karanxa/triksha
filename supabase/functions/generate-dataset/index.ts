import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { augmentPrompts } from './promptAugmenter.ts'
import { generateRecipePrompts } from './recipeGenerator.ts'
import { generateAdversarialPrompts } from './adversarialGenerator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { 
      name,
      description,
      originalPrompts,
      numSamples,
      method,
      recipe,
      targetModel,
      adversarialConfig,
      fingerprintResults,
      useOpenAI 
    } = await req.json()

    // Validate required fields
    if (!name) {
      throw new Error('Invalid input: name is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No authorization header')

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) throw userError || new Error('User not found')

    // Generate prompts based on method
    let generatedPrompts: string[] = []
    
    if (method === 'manual') {
      generatedPrompts = originalPrompts
    } else if (method === 'recipe') {
      console.log('Generating recipe prompts:', { recipe, targetModel, numSamples });
      generatedPrompts = await generateRecipePrompts({
        recipe,
        targetModel,
        numSamples: parseInt(numSamples)
      })
    } else if (method === 'adversarial') {
      generatedPrompts = await generateAdversarialPrompts(
        adversarialConfig,
        parseInt(numSamples)
      )
    }

    // Use original prompts if OpenAI is disabled, otherwise enhance them
    let apiKey = undefined
    if (useOpenAI) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('api_keys')
        .eq('id', user.id)
        .single()

      if (!profile?.api_keys?.openai) {
        throw new Error('OpenAI API key not found')
      }
      apiKey = profile.api_keys.openai
    }

    const augmentedPrompts = useOpenAI && apiKey
      ? await augmentPrompts(generatedPrompts, fingerprintResults, apiKey)
      : generatedPrompts

    // Create CSV content
    const csvContent = 'prompt,category\n' +
      augmentedPrompts.map((prompt: string) => {
        return `"${prompt.replace(/"/g, '""')}","${method}"`
      }).join('\n')

    // Upload to storage
    const timestamp = new Date().getTime()
    const filePath = `${user.id}/${timestamp}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`

    const { error: uploadError } = await supabase.storage
      .from('datasets')
      .upload(filePath, csvContent, {
        contentType: 'text/csv',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Create dataset record
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .insert({
        name,
        description,
        user_id: user.id,
        file_path: filePath,
        category: method,
        metadata: {
          promptCount: augmentedPrompts.length,
          useOpenAI,
          method,
          recipe,
          adversarialConfig
        }
      })
      .select()
      .single()

    if (datasetError) throw datasetError

    return new Response(
      JSON.stringify({ 
        success: true, 
        dataset
      }),
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