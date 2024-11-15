import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompts, keyword, provider } = await req.json();
    
    if (!Array.isArray(prompts) || !keyword || !provider) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
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

    // Fetch user's API keys
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

    const systemPrompt = `You are an expert in helping generate authentic customer voice prompts. Your task is to help us write prompts that sound like they're coming directly from real customers in the ${keyword} context.

Guidelines:
- Write as if you are a real customer expressing their needs, questions, or concerns
- Use first-person perspective ("I need", "I'm looking for", "Can you help me with")
- Include realistic customer emotions, frustrations, and desires
- Reference common situations that customers in ${keyword} context face
- Keep the language casual and conversational, like how real people talk
- Avoid any business or technical jargon unless it's commonly used by customers
- Make it personal and relatable
- Include specific details that a real customer would mention
- Focus on what the customer wants to achieve or solve

Format: Return only the transformed prompt in first-person customer voice, without any explanations or additional text.`;

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
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('OpenAI API error:', error);
          throw new Error(`OpenAI API error: ${error}`);
        }

        const data = await response.json();
        const augmentedText = data.choices[0].message.content;

        // Store the prompt in the database
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