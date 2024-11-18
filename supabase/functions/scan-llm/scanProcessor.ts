import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { processProviderResponse } from "./utils/responseProcessor.ts";
import { handleOpenAIRequest } from "./providers/openai.ts";
import { handleAnthropicRequest } from "./providers/anthropic.ts";
import { handleGeminiRequest } from "./providers/gemini.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import { handleCustomEndpoint } from "./customEndpoint.ts";

export async function processScan(
  scanId: string,
  prompts: string[],
  provider: string | null,
  customEndpoint: any,
  apiKeys: any,
  supabase: any,
  userId: string
) {
  const [baseProvider, model] = provider ? provider.split('-') : [null, null];
  console.log('Processing scan with provider:', baseProvider, 'model:', model);

  const results = [];
  
  for (const prompt of prompts) {
    try {
      console.log('Processing prompt:', prompt);
      
      // Get response from provider
      let response;
      try {
        response = await getProviderResponse(prompt, baseProvider, model, customEndpoint, apiKeys);
        console.log('Raw provider response:', response);
      } catch (error) {
        console.error('Provider response error:', error);
        throw new Error(`Provider error: ${error.message}`);
      }
      
      // Extract readable response
      const modelResponse = processProviderResponse(response, baseProvider || 'custom');
      console.log('Processed response:', modelResponse);

      // Store result
      const { error: resultError } = await supabase
        .from('llm_scan_results')
        .insert({
          scan_id: scanId,
          user_id: userId,
          prompt,
          model_response: modelResponse,
          raw_response: response,
          provider: baseProvider || 'custom',
          model: model || 'custom-endpoint'
        })
        .single();

      if (resultError) {
        console.error('Error storing result:', resultError);
        throw new Error(`Database error: ${resultError.message}`);
      }

      results.push({
        prompt,
        model_response: modelResponse,
        raw_response: response
      });

    } catch (error) {
      console.error('Error processing prompt:', error);
      results.push({
        prompt,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      
      // Update scan status with error
      await supabase
        .from('llm_scans')
        .update({
          status: 'failed',
          results: {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            responses: results
          }
        })
        .eq('id', scanId);
        
      throw error;
    }
  }

  // Update scan status
  await supabase
    .from('llm_scans')
    .update({
      status: 'completed',
      results: {
        responses: results
      }
    })
    .eq('id', scanId);

  return results;
}

async function getProviderResponse(
  prompt: string,
  provider: string | null,
  model: string | null,
  customEndpoint: any,
  apiKeys: any
) {
  // Only use customEndpoint if no standard provider is specified
  if (!provider && customEndpoint) {
    return await handleCustomEndpoint(prompt, customEndpoint);
  }

  // Handle standard providers without health checks
  switch (provider) {
    case 'openai':
      if (!apiKeys.openai) throw new Error('OpenAI API key not configured');
      return await handleOpenAIRequest(prompt, apiKeys.openai, model);
    
    case 'anthropic':
      if (!apiKeys.anthropic) throw new Error('Anthropic API key not configured');
      return await handleAnthropicRequest(prompt, apiKeys.anthropic, model);
    
    case 'google':
      if (!apiKeys.gemini) throw new Error('Google API key not configured');
      return await handleGeminiRequest(prompt, apiKeys.gemini, model);
    
    case 'ollama':
      if (!apiKeys.ollama_endpoint) throw new Error('Ollama endpoint not configured');
      return await handleOllamaRequest(prompt, apiKeys.ollama_endpoint, model);
    
    default:
      if (customEndpoint) {
        return await handleCustomEndpoint(prompt, customEndpoint);
      }
      throw new Error(`Unsupported provider: ${provider}`);
  }
}