import { CustomEndpointConfig } from '../types.ts';

export async function processCustomEndpointRequest(
  prompt: string,
  config: CustomEndpointConfig,
  timeoutMs: number
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let result;
    switch (config.inputType) {
      case 'curl':
        result = await processCurlRequest(prompt, config, controller.signal);
        break;
      case 'http':
        result = await processHttpRequest(prompt, config, controller.signal);
        break;
      case 'manual':
        result = await processManualRequest(prompt, config, controller.signal);
        break;
      default:
        throw new Error(`Unsupported input type: ${config.inputType}`);
    }

    if (!result) {
      throw new Error('No response received from endpoint');
    }

    return result;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs/1000} seconds`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseHttpRequest(rawRequest: string): {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
} {
  const lines = rawRequest.split('\n');
  const [methodLine, ...rest] = lines;
  const [method, path] = methodLine.split(' ');
  
  let headers: Record<string, string> = {};
  let body = '';
  let isBody = false;
  
  for (const line of rest) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      isBody = true;
      continue;
    }
    
    if (!isBody) {
      if (trimmedLine.startsWith('Host: ')) {
        const host = trimmedLine.replace('Host: ', '').trim();
        // Construct full URL from host and path
        const protocol = host.includes(':') ? 'http://' : 'https://';
        headers['Host'] = host;
        continue;
      }
      
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > -1) {
        const key = trimmedLine.slice(0, colonIndex).trim();
        const value = trimmedLine.slice(colonIndex + 1).trim();
        headers[key] = value;
      }
    } else {
      body += trimmedLine;
    }
  }
  
  // Construct full URL
  const host = headers['Host'];
  const protocol = host?.includes(':') ? 'http://' : 'https://';
  const url = `${protocol}${host}${path}`;
  
  return { method, url, headers, body };
}

async function processHttpRequest(
  prompt: string,
  config: CustomEndpointConfig,
  signal: AbortSignal
): Promise<any> {
  console.log('Processing HTTP request with config:', config);
  
  if (!config.httpRequest) {
    throw new Error('HTTP request configuration is missing');
  }

  const { method, url, headers, body } = parseHttpRequest(config.httpRequest);
  console.log('Parsed HTTP request:', { method, url, headers });

  // Replace placeholder in URL and body
  const finalUrl = url.replace(config.placeholder || '{PROMPT}', encodeURIComponent(prompt));
  let finalBody = body;
  
  if (body) {
    finalBody = body.replace(config.placeholder || '{PROMPT}', prompt);
    // Handle URL encoded form data
    if (headers['Content-Type']?.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(finalBody);
      finalBody = params.toString();
    }
  }

  try {
    console.log('Making request to:', finalUrl);
    const response = await fetch(finalUrl, {
      method,
      headers,
      body: ['GET', 'HEAD'].includes(method) ? undefined : finalBody,
      signal
    });

    if (!response.ok) {
      throw new Error(`Custom endpoint returned status ${response.status}`);
    }

    const result = await response.json();
    console.log('Received response:', result);
    
    return {
      model_response: JSON.stringify(result),
      raw_response: result
    };
  } catch (error) {
    console.error('Error in HTTP request:', error);
    throw error;
  }
}

async function processCurlRequest(
  prompt: string,
  config: CustomEndpointConfig,
  signal: AbortSignal
): Promise<any> {
  const requestBody = {
    aegis_payload: {
      input: [{ role: "user", content: prompt }],
      guardrail_conf: [
        {
          name: "list_checker",
          required: true,
          mandatory_accept: false,
          parameters: "{\"fuzzy\": \"true\"}",
          is_llm: false
        },
        {
          name: "llm_guard",
          required: true,
          mandatory_accept: false,
          parameters: "{}",
          is_llm: true
        }
      ],
      min_consensus: 2
    },
    llm_payload: {
      model: "SAQ-v7-all-fk-gpt-turbo-v1.5",
      messages: [
        { role: "system", content: "Hello" },
        { role: "user", content: prompt }
      ],
      max_tokens: 120,
      temperature: 0,
      top_p: 1,
      stop: ["<|eot_id|>"]
    },
    llm_endpoint: "http://saq-v7-fk-gpt-char-fix-modelhost.mlp-h100-modelhost-prod.fkcloud.in/predict"
  };

  try {
    const response = await fetch('http://10.83.33.100/fk_jarvis_aegis/v1/evaluate_prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal
    });

    if (!response.ok) {
      throw new Error(`Custom endpoint returned status ${response.status}`);
    }

    const result = await response.json();
    return {
      model_response: JSON.stringify(result),
      raw_response: result
    };
  } catch (error) {
    console.error('Error in curl request:', error);
    throw error;
  }
}

async function processManualRequest(
  prompt: string,
  config: CustomEndpointConfig,
  signal: AbortSignal
): Promise<any> {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
    ...(config.headers ? JSON.parse(config.headers) : {})
  };

  const response = await fetch(config.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt }),
    signal
  });

  if (!response.ok) {
    throw new Error(`Custom endpoint returned status ${response.status}`);
  }

  const result = await response.json();
  return {
    model_response: JSON.stringify(result),
    raw_response: result
  };
}