export async function handleOllamaRequest(prompt: string, endpoint: string, model = 'llama2') {
  const modelMap: { [key: string]: string } = {
    'llama2': 'llama2',
    'mistral': 'mistral',
    'codellama': 'codellama'
  };

  const apiModel = modelMap[model] || 'llama2';

  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: apiModel,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${errorText}`);
  }

  return await response.json();
}