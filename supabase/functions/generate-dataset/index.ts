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
    if (!name || !originalPrompts || !Array.isArray(originalPrompts)) {
      throw new Error('Invalid input: name and originalPrompts array are required')
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

    // Get user's API key only if OpenAI enhancement is enabled
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

    // Use original prompts if OpenAI is disabled, otherwise enhance them
    const augmentedPrompts = useOpenAI && apiKey
      ? await augmentPrompts(originalPrompts, fingerprintResults, apiKey)
      : originalPrompts

    // Test augmented prompts with target model
    const testResults = await testPromptsWithModel(
      augmentedPrompts,
      targetModel?.split('-')[0],
      targetModel?.split('-')[1],
      apiKey
    )

    // Create CSV content
    const csvContent = 'original_prompt,augmented_prompt,model_response,error\n' +
      originalPrompts.map((original: string, index: number) => {
        const result = testResults[index]
        const augmented = augmentedPrompts[index]
        return `"${original.replace(/"/g, '""')}","${augmented.replace(/"/g, '""')}","${(result.response || '').replace(/"/g, '""')}","${(result.error || '').replace(/"/g, '""')}"`
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
          fingerprintResults: useOpenAI ? fingerprintResults : null,
          originalCount: originalPrompts.length,
          augmentedCount: augmentedPrompts.length,
          testResults: testResults.map((r: any) => ({ error: r.error || null })),
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