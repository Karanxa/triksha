export async function handleCustomRequest(prompt: string, customEndpoint: any) {
  try {
    if (customEndpoint.curlCommand) {
      const modifiedCommand = customEndpoint.curlCommand
        .replace(customEndpoint.placeholder || '{PROMPT}', prompt);
      
      const response = await fetch(customEndpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {})
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error(`Custom endpoint error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || data.text || data.content || JSON.stringify(data);
    }

    const response = await fetch(customEndpoint.url, {
      method: customEndpoint.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {})
      },
      body: JSON.stringify({
        [customEndpoint.placeholder || 'prompt']: prompt
      })
    });

    if (!response.ok) {
      throw new Error(`Custom endpoint error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || data.text || data.content || JSON.stringify(data);
  } catch (error) {
    console.error('Error in custom request:', error);
    throw new Error(`Custom endpoint error: ${error.message}`);
  }
}