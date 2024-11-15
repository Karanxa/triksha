interface OllamaResponse {
  model: string;
  response: string;
}

export const handleOllamaRequest = async (prompt: string, endpoint: string): Promise<string> => {
  console.log(`Connecting to Ollama endpoint: ${endpoint}`);
  
  try {
    // First, validate the endpoint
    if (!endpoint) {
      throw new Error('Ollama endpoint URL is not configured');
    }

    // Ensure endpoint doesn't end with a slash
    const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    
    // Check if endpoint is reachable and get available models
    console.log('Fetching available models from Ollama...');
    const modelsResponse = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!modelsResponse.ok) {
      const errorText = await modelsResponse.text();
      console.error('Failed to fetch Ollama models:', errorText);
      throw new Error(`Failed to connect to Ollama: ${modelsResponse.statusText}`);
    }

    const models = await modelsResponse.json();
    console.log('Available Ollama models:', models);

    // Look specifically for llama2
    const llama2Model = models.models?.find((m: any) => 
      m.name.toLowerCase().includes('llama2') || 
      m.name.toLowerCase() === 'llama2'
    );
    
    const modelToUse = llama2Model?.name || 'llama2';
    console.log(`Using Ollama model: ${modelToUse}`);

    // Make the generation request
    console.log('Sending prompt to Ollama...');
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error:', errorText);
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json() as OllamaResponse;
    console.log('Received response from Ollama');
    return data.response;
  } catch (error) {
    console.error('Error in Ollama request:', error);
    throw new Error(`Failed to get response from Ollama: ${error.message}`);
  }
};