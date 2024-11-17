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
    console.log('Processing custom endpoint request:', { inputType: config.inputType });
    
    if (config.inputType === 'curl') {
      console.log('Processing cURL command with prompt:', prompt);
      
      // Parse the curl command body
      const bodyMatch = config.curlCommand.match(/--data\s+'(.+?)'/s);
      if (!bodyMatch) {
        throw new Error('Could not parse request body from cURL command');
      }
      
      // Get the request body and parse it
      let body = bodyMatch[1];
      
      // Replace the placeholder with the actual prompt
      body = body.replace(new RegExp(config.placeholder, 'g'), prompt);
      
      // Parse URL from curl command
      const urlMatch = config.curlCommand.match(/curl\s+.*?'(http[^']+)'/);
      if (!urlMatch) {
        throw new Error('Could not parse URL from cURL command');
      }
      const url = urlMatch[1];
      
      // Extract headers from curl command
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      const headerMatches = config.curlCommand.matchAll(/--header\s+'([^:]+):\s*([^']+)'/g);
      for (const match of Array.from(headerMatches)) {
        headers[match[1].trim()] = match[2].trim();
      }
      
      console.log('Making request to:', url);
      console.log('With headers:', headers);
      console.log('With body:', body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Custom endpoint error:', response.status, errorText);
        throw new Error(`Custom endpoint returned status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Custom endpoint response:', result);
      return result;
      
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
        const errorText = await response.text();
        console.error('Custom endpoint error:', response.status, errorText);
        throw new Error(`Custom endpoint returned status ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Custom endpoint response:', result);
      return result;
    }
  } catch (error) {
    console.error('Custom endpoint error:', error);
    throw error;
  }
}