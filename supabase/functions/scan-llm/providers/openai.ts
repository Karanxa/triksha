import { corsHeaders } from '../cors.ts';

export const handleOpenAIRequest = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add it in Settings.');
  }

  console.log('Making OpenAI request for prompt:', prompt);
  
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
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData?.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in OpenAI request:', error);
    throw error;
  }
};