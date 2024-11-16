import { CustomEndpoint } from '../types.ts';

export async function processCustomEndpoint(customEndpoint: CustomEndpoint, prompt: string) {
  let url: string;
  let headers: Record<string, string> = {};
  let body: any;

  if (customEndpoint.inputType === 'curl') {
    const parsed = parseCurlCommand(
      customEndpoint.curlCommand,
      customEndpoint.placeholder,
      prompt
    );
    url = parsed.url;
    headers = parsed.headers;
    body = parsed.body;
  } else {
    url = customEndpoint.url;
    headers = {
      'Content-Type': 'application/json',
      ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {}),
    };
    if (customEndpoint.apiKey) {
      headers['Authorization'] = `Bearer ${customEndpoint.apiKey}`;
    }
    body = { prompt };
  }

  console.log(`Making request to custom endpoint for prompt: ${prompt}`);
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Custom endpoint error: ${response.statusText}`);
  }

  const responseData = await response.json();
  return responseData.response || responseData.model_response || responseData.text || JSON.stringify(responseData);
}

function parseCurlCommand(curlCommand: string, placeholder: string, prompt: string) {
  const urlMatch = curlCommand.match(/curl ['"]([^'"]+)['"]/);
  const headersMatch = curlCommand.match(/-H ['"]([^'"]+)['"]/g);
  const dataMatch = curlCommand.match(/-d ['"]([^'"]+)['"]/);
  
  if (!urlMatch) {
    throw new Error('Invalid cURL command: URL not found');
  }

  const url = urlMatch[1];
  const headers: Record<string, string> = {};
  
  headersMatch?.forEach(header => {
    const [key, value] = header.match(/-H ['"]([^'"]+)['"]/)?.[1].split(': ') ?? [];
    if (key && value) {
      headers[key] = value;
    }
  });

  let body = dataMatch?.[1] ?? '{}';
  body = body.replace(placeholder, prompt);

  try {
    body = JSON.parse(body);
  } catch {
    throw new Error('Invalid JSON body in cURL command');
  }

  return { url, headers, body };
}