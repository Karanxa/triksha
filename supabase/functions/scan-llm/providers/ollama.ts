export async function handleOllamaRequest(
  prompt: string, 
  endpoint: string, 
  modelName: string,
  customCurl?: string
) {
  try {
    const requestHeaders = {
      'Content-Type': 'application/json',
    };

    const requestBody = JSON.stringify({
      model: modelName,
      prompt: prompt,
    });

    console.log('Sending Ollama request:', {
      url: `${endpoint}/api/generate`,
      method: 'POST',
      headers: requestHeaders,
      body: requestBody
    });

    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: requestHeaders,
      body: requestBody
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Return verbose information
    return {
      request: {
        url: `${endpoint}/api/generate`,
        method: 'POST',
        headers: requestHeaders,
        body: JSON.parse(requestBody)
      },
      response: {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseData
      },
      model_response: responseData.response || 'No response text available'
    };

  } catch (error) {
    console.error('Error in Ollama request:', error);
    throw error;
  }
}