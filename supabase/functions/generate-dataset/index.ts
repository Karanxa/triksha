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
      provider,
      model,
      fingerprintResults 
    } = await req.json()

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

    // Get user's API key
    const { data: profile } = await supabase
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single()

    if (!profile?.api_keys?.openai) {
      throw new Error('OpenAI API key not found')
    }

    // Step 1: Augment prompts using fingerprint results
    const augmentedPrompts = await augmentPrompts(
      originalPrompts,
      fingerprintResults,
      profile.api_keys.openai
    )

    // Step 2: Test augmented prompts with target model
    const testResults = await testPromptsWithModel(
      augmentedPrompts,
      provider,
      model,
      profile.api_keys[provider] || profile.api_keys.openai
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
        category: 'augmented',
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