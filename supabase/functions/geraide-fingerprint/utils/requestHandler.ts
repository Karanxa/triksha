import { validateEndpoint } from './validation.ts';

export async function handleRequest(provider: string, model: string, prompt: string, customEndpoint: any) {
  if (provider === 'custom' && customEndpoint) {
    const isValid = await validateEndpoint(customEndpoint);
    if (!isValid) {
      throw new Error('Failed to validate custom endpoint');
    }

    if (customEndpoint.inputType === 'curl') {
      return await handleCurlRequest(prompt);
    } else {
      return await handleManualRequest(prompt, customEndpoint);
    }
  }

  // Handle other providers...
  throw new Error(`Unsupported provider: ${provider}`);
}

async function handleCurlRequest(prompt: string) {
  const requestBody = {
    aegis_payload: {
      input: [{ role: "user", content: prompt }],
      guardrail_conf: [{
        name: "list_checker",
        required: true,
        mandatory_accept: false,
        parameters: "{\"fuzzy\": \"true\"}",
        is_llm: false
      }],
      min_consensus: 1
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

  const response = await fetch('http://10.83.33.100/fk_jarvis_aegis/v1/evaluate_prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return await response.json();
}

async function handleManualRequest(prompt: string, customEndpoint: any) {
  const headers = {
    'Content-Type': 'application/json',
    ...(customEndpoint.headers ? JSON.parse(customEndpoint.headers) : {})
  };

  if (customEndpoint.apiKey) {
    headers['Authorization'] = `Bearer ${customEndpoint.apiKey}`;
  }

  const response = await fetch(customEndpoint.url, {
    method: customEndpoint.method || 'POST',
    headers,
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return await response.json();
}