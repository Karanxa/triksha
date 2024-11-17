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
      
      // For Aegis API, construct the request body following their format
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
      
      // Extract URL from curl command - use the actual URL from config
      const url = 'http://10.83.33.100/fk_jarvis_aegis/v1/evaluate_prompt';
      
      console.log('Making request to:', url);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
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
          return result;
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          return {
            error: `Failed to parse response: ${responseText}`
          };
        }
      } catch (networkError) {
        console.error('Network error:', networkError);
        return {
          error: `Network error: ${networkError.message}`
        };
      }
      
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
        return {
          error: `Custom endpoint returned status ${response.status}: ${errorText}`
        };
      }
      
      const result = await response.json();
      console.log('Custom endpoint response:', result);
      return result;
    }
  } catch (error) {
    console.error('Custom endpoint error:', error);
    return {
      error: error.message
    };
  }
}