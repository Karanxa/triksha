import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { augmentPrompts } from './promptAugmenter.ts'
import { testPromptsWithModel } from './modelTester.ts'
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
      basePrompt,
      numSamples,
      method,
      recipe,
      targetModel,
      adversarialConfig,
      fingerprintResults,
      userId
    } = await req.json()

    if (!name || !userId) {
      throw new Error('Invalid input: name and userId are required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate prompts based on method
    let originalPrompts: string[] = []
    
    if (method === 'manual' && basePrompt) {
      originalPrompts = Array(numSamples).fill(basePrompt)
    } else if (method === 'recipe') {
      originalPrompts = await generateRecipePrompts({ recipe, targetModel, numSamples })
    } else if (method === 'adversarial') {
      originalPrompts = await generateAdversarialPrompts(adversarialConfig, numSamples)
    }

    // Get user's API key
    const { data: profile } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', userId)
      .single()

    if (!profile?.api_keys?.openai) {
      throw new Error('OpenAI API key not found')
    }

    // Augment prompts using fingerprint results if available
    const augmentedPrompts = fingerprintResults 
      ? await augmentPrompts(originalPrompts, fingerprintResults, profile.api_keys.openai)
      : originalPrompts

    // Test prompts with target model
    const testResults = await testPromptsWithModel(
      augmentedPrompts,
      targetModel.split('-')[0],
      targetModel.split('-')[1],
      profile.api_keys.openai
    )

    // Create CSV content
    const csvContent = 'original_prompt,augmented_prompt,model_response,error\n' +
      originalPrompts.map((original, index) => {
        const result = testResults[index]
        const augmented = augmentedPrompts[index]
        return `"${original.replace(/"/g, '""')}","${augmented.replace(/"/g, '""')}","${(result.response || '').replace(/"/g, '""')}","${(result.error || '').replace(/"/g, '""')}"`
      }).join('\n')

    // Upload to storage
    const timestamp = new Date().getTime()
    const filePath = `${userId}/${timestamp}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`

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
        user_id: userId,
        file_path: filePath,
        category: method,
        metadata: {
          fingerprintResults,
          originalCount: originalPrompts.length,
          augmentedCount: augmentedPrompts.length,
          testResults: testResults.map(r => ({ error: r.error || null }))
        }
      })
      .select()
      .single()

    if (datasetError) throw datasetError

    return new Response(
      JSON.stringify({ 
        success: true, 
        dataset,
        testResults 
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