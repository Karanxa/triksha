export async function handleOllamaRequest(prompt: string, endpoint: string, model = 'llama2') {
  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${await response.text()}`);
  }

  return await response.json();
}