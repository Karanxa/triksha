import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { augmentPrompts } from './promptAugmenter.ts'
import { testPromptsWithModel } from './modelTester.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting dataset generation...')
    const { 
      name, 
      description, 
      basePrompt,
      numSamples,
      method,
      recipe,
      targetModel,
      adversarialConfig,
      fingerprintResults 
    } = await req.json()

    console.log('Received parameters:', { name, method, targetModel })

    if (!name) {
      throw new Error('Dataset name is required')
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

    // Get user's API key
    const { data: profile } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    if (!profile?.api_keys?.openai) {
      throw new Error('OpenAI API key not found')
    }

    // Generate prompts based on method
    console.log('Generating prompts using method:', method)
    let prompts: string[] = []
    
    if (method === 'manual' && basePrompt) {
      // For manual method, create variations of the base prompt
      prompts = Array(parseInt(numSamples)).fill(basePrompt)
    } else if (method === 'recipe' && recipe) {
      // For recipe method, use the selected recipe to generate prompts
      prompts = Array(parseInt(numSamples)).fill(`Using ${recipe} recipe: ${basePrompt || 'Generate a prompt'}`)
    } else if (method === 'adversarial' && adversarialConfig) {
      // For adversarial method, generate adversarial prompts
      prompts = Array(parseInt(numSamples)).fill(`Adversarial prompt with config: ${JSON.stringify(adversarialConfig)}`)
    } else {
      throw new Error('Invalid method or missing required parameters')
    }

    // Step 1: Augment prompts using fingerprint results if available
    console.log('Augmenting prompts with fingerprint results...')
    const augmentedPrompts = await augmentPrompts(
      prompts,
      fingerprintResults,
      profile.api_keys.openai
    )

    // Step 2: Test augmented prompts with target model
    console.log('Testing prompts with target model...')
    const [provider, model] = (targetModel || '').split('-')
    const testResults = await testPromptsWithModel(
      augmentedPrompts,
      provider || 'openai',
      model || 'gpt-4',
      profile.api_keys.openai
    )

    // Create CSV content
    const csvContent = 'original_prompt,augmented_prompt,model_response,error\n' +
      prompts.map((original, index) => {
        const result = testResults[index]
        const augmented = augmentedPrompts[index]
        return `"${original.replace(/"/g, '""')}","${augmented.replace(/"/g, '""')}","${(result.response || '').replace(/"/g, '""')}","${(result.error || '').replace(/"/g, '""')}"`
      }).join('\n')

    // Upload to storage
    console.log('Uploading dataset to storage...')
    const timestamp = new Date().getTime()
    const filePath = `${user.id}/${timestamp}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`

    const { error: uploadError } = await supabase.storage
      .from('datasets')
      .upload(filePath, csvContent, {
        contentType: 'text/csv',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload dataset: ${uploadError.message}`)
    }

    // Create dataset record
    console.log('Creating dataset record...')
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .insert({
        name,
        description,
        user_id: user.id,
        file_path: filePath,
        category: method,
        metadata: {
          fingerprintResults,
          originalCount: prompts.length,
          augmentedCount: augmentedPrompts.length,
          testResults: testResults.map(r => ({ error: r.error || null }))
        }
      })
      .select()
      .single()

    if (datasetError) {
      console.error('Dataset creation error:', datasetError)
      throw new Error(`Failed to create dataset record: ${datasetError.message}`)
    }

    console.log('Dataset generation completed successfully')
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
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})