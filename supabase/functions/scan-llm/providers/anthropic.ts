export async function handleAnthropicRequest(prompt: string, apiKey: string, model = 'claude-3-sonnet-20240229') {
  const modelMap: { [key: string]: string } = {
    'claude-3-opus-20240229': 'claude-3-opus-20240229',
    'claude-3-sonnet-20240229': 'claude-3-sonnet-20240229'
  };

  const apiModel = modelMap[model] || 'claude-3-sonnet-20240229';

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