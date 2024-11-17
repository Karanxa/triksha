import { checkEndpointHealth } from './utils/healthCheck.ts';
import { processCustomEndpointRequest } from './utils/requestProcessor.ts';
import { CustomEndpointConfig } from './types.ts';

const TIMEOUT_MS = 30000; // 30 second timeout for individual requests

export async function handleCustomEndpoint(
  prompt: string,
  config: CustomEndpointConfig
): Promise<any> {
  try {
    console.log('Processing custom endpoint request:', { 
      inputType: config.inputType,
      method: config.method,
      url: config.url 
    });
    
    // Extract base URL for health check
    let url = config.url;
    if (config.inputType === 'curl') {
      url = 'http://10.83.33.100/fk_jarvis_aegis/v1/evaluate_prompt';
    }

    // Check endpoint health first
    const isHealthy = await checkEndpointHealth(url);
    if (!isHealthy) {
      console.error('Endpoint health check failed for URL:', url);
      return {
        error: 'Endpoint is not accessible or not responding. Please check the URL and try again.'
      };
    }

    // Process the request with timeout
    const result = await processCustomEndpointRequest(prompt, config, TIMEOUT_MS);
    console.log('Custom endpoint request completed successfully');
    return result;
  } catch (error) {
    console.error('Custom endpoint error:', error);
    return {
      error: error instanceof Error ? 
        `Custom endpoint error: ${error.message}` : 
        'Unknown error occurred while processing the request'
    };
  }
}