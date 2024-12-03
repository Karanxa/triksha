import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { generateRecipePrompts } from "./recipeGenerator.ts"
import { generateAdversarialPrompts } from "./adversarialGenerator.ts"

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
      adversarialConfig 
    } = await req.json()

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
    let prompts: string[];
    if (method === 'manual') {
      prompts = Array(numSamples).fill(basePrompt);
    } else if (method === 'recipe') {
      prompts = await generateRecipePrompts({
        recipe,
        targetModel,
        numSamples
      });
    } else {
      prompts = await generateAdversarialPrompts(adversarialConfig, numSamples);
    }

    // Create CSV content
    const csvContent = 'original_prompt\n' + prompts.map(prompt => 
      `"${prompt.replace(/"/g, '""')}"`
    ).join('\n');

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
          method,
          recipe: recipe || null,
          targetModel: targetModel || null,
          adversarialConfig: adversarialConfig || null,
          promptCount: prompts.length
        }
      })
      .select()
      .single()

    if (datasetError) throw datasetError

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