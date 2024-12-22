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
      curlCommand: config.curlCommand,
      placeholder: config.placeholder
    });

    // Replace placeholder with actual prompt in curl command
    const modifiedCurl = config.curlCommand.replace(
      config.placeholder || '{PROMPT}',
      prompt
    );

    // Execute the curl command
    const process = new Deno.Command('curl', {
      args: modifiedCurl.split(' ').slice(1), // Remove 'curl' from the start
      stdout: 'piped',
      stderr: 'piped',
    });

    const { stdout, stderr } = await process.output();
    const output = new TextDecoder().decode(stdout);
    const error = new TextDecoder().decode(stderr);

    if (error) {
      console.error('Error executing curl command:', error);
      throw new Error(error);
    }

    try {
      // Try to parse the response as JSON
      return JSON.parse(output);
    } catch {
      // If not JSON, return as plain text
      return { response: output };
    }
  } catch (error) {
    console.error('Custom endpoint error:', error);
    throw new Error(`Custom endpoint error: ${error.message}`);
  }
}