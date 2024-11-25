export async function validateEndpoint(customEndpoint: any): Promise<boolean> {
  try {
    console.log('Validating endpoint:', customEndpoint.url || 'Custom curl endpoint');
    
    if (customEndpoint.inputType === 'curl') {
      const requestBody = {
        aegis_payload: {
          input: [{ role: "user", content: "Test validation message" }],
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
            { role: "user", content: "Test validation message" }
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
        throw new Error(`Validation failed with status ${response.status}`);
      }

      const data = await response.json();
      return Boolean(data?.llm_response?.response);
    } else {
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
        body: JSON.stringify({ prompt: "Test validation message" })
      });

      if (!response.ok) {
        throw new Error(`Validation failed with status ${response.status}`);
      }

      const data = await response.json();
      return Boolean(data);
    }
  } catch (error) {
    console.error('Endpoint validation error:', error);
    return false;
  }
}