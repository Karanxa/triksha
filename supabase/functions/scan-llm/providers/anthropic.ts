export async function handleAnthropicRequest(prompt: string, apiKey: string, model = 'claude-3-sonnet-20240229') {
  // Map our frontend model names to actual Anthropic API model names
  const modelMap: { [key: string]: string } = {
    'claude-3-opus-20240229': 'claude-3-opus-20240229',
    'claude-3-sonnet-20240229': 'claude-3-sonnet-20240229'
  };

  const apiModel = modelMap[model] || 'claude-3-sonnet-20240229'; // fallback to a safe default

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: apiModel,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${errorText}`);
  }

  return await response.json();
}