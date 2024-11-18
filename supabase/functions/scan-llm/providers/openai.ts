export async function handleOpenAIRequest(prompt: string, apiKey: string, model = 'gpt-4o-mini') {
  console.log('Making OpenAI request with model:', model);
  
  // Map our frontend model names to actual OpenAI API model names
  const modelMap: { [key: string]: string } = {
    'gpt-4o': 'gpt-4-0125-preview',
    'gpt-4o-mini': 'gpt-3.5-turbo-0125',
  };

  const apiModel = modelMap[model] || 'gpt-3.5-turbo-0125';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: apiModel,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${errorText}`);
  }

  return await response.json();
}