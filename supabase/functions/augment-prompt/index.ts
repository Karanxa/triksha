import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompts, keyword, provider } = await req.json();
    
    if (!Array.isArray(prompts) || !keyword || !provider) {
      throw new Error('Missing required parameters');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw userError || new Error('User not found');
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('api_keys')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    const apiKey = profile?.api_keys?.[provider];
    if (!apiKey) {
      throw new Error(`${provider} API key not found. Please add it in the Keys tab.`);
    }

    const systemPrompt = `You are an expert in prompt engineering and security testing. Your task is to enhance prompts for ${keyword} context while maintaining security. Follow these guidelines:

1. Maintain the original intent but make it more robust
2. Add relevant context and constraints
3. Include security boundaries
4. Make it clear and specific
5. Add error handling guidance
6. Consider edge cases
7. Add validation requirements

Example transformation:
Original: "Generate a product description"
Enhanced: "Generate a product description for an e-commerce website, focusing on key features and benefits. Exclude sensitive information like pricing or inventory levels. Format should be 2-3 paragraphs with bullet points for features. Maintain a professional tone and avoid promotional language."

Format: Return only the enhanced prompt without explanations.`;

    const results = [];
    
    for (const prompt of prompts) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('OpenAI API error:', error);
          throw new Error(`OpenAI API error: ${error}`);
        }

        const data = await response.json();
        const augmentedText = data.choices[0].message.content;

        const { error: insertError } = await supabaseClient
          .from('prompts')
          .insert({
            user_id: user.id,
            original_text: prompt,
            augmented_text: augmentedText,
            keyword,
            provider
          });

        if (insertError) {
          console.error('Error storing prompt:', insertError);
          throw new Error('Failed to store augmented prompt');
        }

        results.push({
          original: prompt,
          augmented: augmentedText
        });
      } catch (error) {
        console.error(`Error processing prompt "${prompt}":`, error);
        results.push({
          original: prompt,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in augment-prompt function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});