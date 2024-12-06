export async function handleOllamaRequest(
  prompt: string, 
  endpoint: string, 
  modelName: string,
  customCurl?: string
) {
  try {
    if (customCurl) {
      // Parse and execute custom curl command
      const curlCommand = customCurl
        .replace('{MODEL}', modelName)
        .replace('{PROMPT}', prompt);
      
      // Execute the custom curl command
      // Note: Implementation depends on how you want to handle custom curl commands
      return { error: 'Custom curl commands not yet implemented' };
    }

    const response = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in Ollama request:', error);
    throw error;
  }
}