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
      let response = await getProviderResponse(prompt, baseProvider, model, customEndpoint, apiKeys);
      console.log('Raw provider response:', response);
      
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

      if (resultError) throw resultError;

      results.push({
        prompt,
        model_response: modelResponse,
        raw_response: response
      });

    } catch (error) {
      console.error('Error processing prompt:', error);
      results.push({
        prompt,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
  if (customEndpoint) {
    return await handleCustomEndpoint(prompt, customEndpoint);
  }

  switch (provider) {
    case 'openai':
      if (!apiKeys.openai) throw new Error('OpenAI API key not configured');
      return await handleOpenAIRequest(prompt, apiKeys.openai, model);
    
    case 'anthropic':
      if (!apiKeys.anthropic) throw new Error('Anthropic API key not configured');
      return await handleAnthropicRequest(prompt, apiKeys.anthropic, model);
    
    case 'gemini':
      if (!apiKeys.gemini) throw new Error('Google API key not configured');
      return await handleGeminiRequest(prompt, apiKeys.gemini, model);
    
    case 'ollama':
      if (!apiKeys.ollama_endpoint) throw new Error('Ollama endpoint not configured');
      return await handleOllamaRequest(prompt, apiKeys.ollama_endpoint, model);
    
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}