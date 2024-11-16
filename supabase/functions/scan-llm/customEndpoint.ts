interface CustomEndpointConfig {
  url: string;
  apiKey: string;
  headers: string;
  placeholder: string;
  curlCommand: string;
  inputType: 'curl' | 'manual';
}

export async function handleCustomEndpoint(
  prompt: string,
  config: CustomEndpointConfig
): Promise<any> {
  try {
    if (config.inputType === 'curl') {
      // Parse and execute curl command
      const curlCommand = config.curlCommand.replace(
        config.placeholder,
        encodeURIComponent(prompt)
      );
      
      // Extract URL and method from curl command
      const urlMatch = curlCommand.match(/curl\s+(?:-X\s+POST\s+)?['"]([^'"]+)['"]/);
      if (!urlMatch) throw new Error('Invalid cURL command - URL not found');
      
      const url = urlMatch[1];
      
      // Extract headers from curl command
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      const headerMatches = curlCommand.matchAll(/-H\s+['"]([^:]+):\s*([^'"]+)['"]/g);
      for (const match of headerMatches) {
        headers[match[1].trim()] = match[2].trim();
      }
      
      // Extract body from curl command
      const bodyMatch = curlCommand.match(/-d\s+['"](.+?)['"]/);
      let body = bodyMatch ? bodyMatch[1] : JSON.stringify({ prompt });
      
      // Replace the placeholder in the body
      body = body.replace(config.placeholder, prompt);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body
      });
      
      if (!response.ok) {
        throw new Error(`Custom endpoint returned status ${response.status}`);
      }
      
      return await response.json();
    } else {
      // Handle manual endpoint configuration
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        ...(config.headers ? JSON.parse(config.headers) : {})
      };
      
      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error(`Custom endpoint returned status ${response.status}`);
      }
      
      return await response.json();
    }
  } catch (error) {
    console.error('Custom endpoint error:', error);
    throw error;
  }
}