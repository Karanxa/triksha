export async function handleOllamaRequest(
  prompt: string, 
  endpoint: string, 
  modelName: string,
  customCurl?: string
) {
  try {
    // Normalize endpoint URL to ensure no double slashes
    const baseUrl = endpoint.replace(/\/+$/, '');
    const requestHeaders = {
      'Content-Type': 'application/json',
    };

    const requestBody = JSON.stringify({
      model: modelName,
      prompt: prompt,
      stream: false
    });

    // Log the full request details
    console.log('Sending Ollama request:', {
      url: `${baseUrl}/api/chat/completions`,
      method: 'POST',
      headers: requestHeaders,
      body: JSON.parse(requestBody)
    });

    // Example cURL command for debugging
    const curlCommand = `curl -X POST ${baseUrl}/api/chat/completions \
      -H 'Content-Type: application/json' \
      -d '${requestBody}'`;
    console.log('Equivalent cURL command:', curlCommand);

    const response = await fetch(`${baseUrl}/api/chat/completions`, {
      method: 'POST',
      headers: requestHeaders,
      body: requestBody
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Return verbose information including the cURL command
    return {
      request: {
        url: `${baseUrl}/api/chat/completions`,
        method: 'POST',
        headers: requestHeaders,
        body: JSON.parse(requestBody),
        curl: curlCommand
      },
      response: {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseData
      },
      model_response: responseData.response || responseData.choices?.[0]?.message?.content || 'No response text available'
    };

  } catch (error) {
    console.error('Error in Ollama request:', error);
    throw error;
  }
}