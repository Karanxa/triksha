import { checkEndpointHealth } from './utils/healthCheck.ts';
import { processCustomEndpointRequest } from './utils/requestProcessor.ts';
import { CustomEndpointConfig } from './types.ts';

const TIMEOUT_MS = 30000; // 30 second timeout for individual requests

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

    // Process the request with timeout
    return await processCustomEndpointRequest(prompt, config, TIMEOUT_MS);
  } catch (error) {
    console.error('Custom endpoint error:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}