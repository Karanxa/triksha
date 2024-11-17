interface CustomEndpointConfig {
  url: string;
  apiKey: string;
  headers: string;
  placeholder: string;
  curlCommand: string;
  inputType: 'curl' | 'manual';
}

const TIMEOUT_MS = 30000; // 30 second timeout

async function checkEndpointHealth(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for health check

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Endpoint health check failed:', error);
    return false;
  }
}

export async function handleCustomEndpoint(
  prompt: string,
  config: CustomEndpointConfig
): Promise<any> {
  try {
    console.log('Processing custom endpoint request:', { inputType: config.inputType });
    
    // Extract base URL for health check
    const url = config.inputType === 'curl' ? 
      'http://10.83.33.100/fk_jarvis_aegis/v1/evaluate_prompt' : 
      config.url;

    // Check endpoint health first
    const isHealthy = await checkEndpointHealth(url);
    if (!isHealthy) {
      return {
        error: 'Endpoint is not accessible or not responding'
      };
    }

    if (config.inputType === 'curl') {
      console.log('Processing cURL command with prompt:', prompt);
      
      const requestBody = {
        aegis_payload: {
          input: [
            {
              role: "user",
              content: prompt
            }
          ],
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
            {
              role: "system",
              content: "Hello"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 120,
          temperature: 0,
          top_p: 1,
          stop: ["<|eot_id|>"]
        },
        llm_endpoint: "http://saq-v7-fk-gpt-char-fix-modelhost.mlp-h100-modelhost-prod.fkcloud.in/predict"
      };
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (!response.ok) {
          console.error('Custom endpoint error:', response.status, responseText);
          return {
            error: `Custom endpoint returned status ${response.status}: ${responseText}`
          };
        }
        
        try {
          const result = JSON.parse(responseText);
          console.log('Parsed response:', result);
          return {
            model_response: JSON.stringify(result),
            raw_response: result
          };
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          return {
            error: `Failed to parse response: ${responseText}`
          };
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          return {
            error: 'Request timed out after 30 seconds'
          };
        }
        console.error('Network error:', error);
        return {
          error: `Network error: ${error.message}`
        };
      }
      
    } else {
      // Handle manual endpoint configuration with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          ...(config.headers ? JSON.parse(config.headers) : {})
        };
        
        const response = await fetch(config.url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ prompt }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Custom endpoint error:', response.status, errorText);
          return {
            error: `Custom endpoint returned status ${response.status}: ${errorText}`
          };
        }
        
        const result = await response.json();
        console.log('Custom endpoint response:', result);
        return {
          model_response: JSON.stringify(result),
          raw_response: result
        };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          return {
            error: 'Request timed out after 30 seconds'
          };
        }
        console.error('Custom endpoint error:', error);
        return {
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
      }
    }
  } catch (error) {
    console.error('Custom endpoint error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}