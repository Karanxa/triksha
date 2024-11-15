interface OllamaResponse {
  model: string;
  response: string;
}

export const handleOllamaRequest = async (prompt: string, endpoint: string): Promise<string> => {
  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama2',  // Default model
      prompt: prompt,
      stream: false
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Ollama API error:', error);
    throw new Error(`Ollama API error: ${error}`);
  }

  const data = await response.json() as OllamaResponse;
  return data.response;
};