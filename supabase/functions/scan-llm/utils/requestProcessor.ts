import { CustomEndpointConfig } from '../types.ts';

export async function processCustomEndpointRequest(
  prompt: string,
  config: CustomEndpointConfig,
  timeoutMs: number
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (config.inputType === 'curl') {
      return await processCurlRequest(prompt, config, controller.signal);
    } else {
      return await processManualRequest(prompt, config, controller.signal);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        error: `Request timed out after ${timeoutMs/1000} seconds`
      };
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
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