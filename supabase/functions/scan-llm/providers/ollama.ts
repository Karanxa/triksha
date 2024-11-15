interface OllamaResponse {
  model: string;
  response: string;
}

export const handleOllamaRequest = async (prompt: string, endpoint: string): Promise<string> => {
  console.log(`Attempting to connect to Ollama endpoint: ${endpoint}`);
  
  try {
    // First, get available models to validate connection
    const modelsResponse = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!modelsResponse.ok) {
      throw new Error(`Failed to fetch Ollama models: ${modelsResponse.statusText}`);
    }

    const models = await modelsResponse.json();
    console.log('Available Ollama models:', models);

    // Use llama2 if available, otherwise use the first available model
    const defaultModel = models.models?.find((m: any) => m.name === 'llama2')?.name || models.models?.[0]?.name;
    
    if (!defaultModel) {
      throw new Error('No models available on the Ollama instance');
    }

    console.log(`Using Ollama model: ${defaultModel}`);

    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: defaultModel,
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
  } catch (error) {
    console.error('Error in Ollama request:', error);
    throw new Error(`Failed to connect to Ollama: ${error.message}`);
  }
};