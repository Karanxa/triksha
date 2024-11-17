export async function handleOllamaRequest(prompt: string, endpoint: string, model = 'llama2') {
  // Map our frontend model names to actual Ollama model names
  const modelMap: { [key: string]: string } = {
    'llama2': 'llama2',
    'mistral': 'mistral',
    'codellama': 'codellama'
  };

  const apiModel = modelMap[model] || 'llama2'; // fallback to a safe default

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