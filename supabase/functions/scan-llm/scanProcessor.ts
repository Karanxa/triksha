import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { processProviderResponse, extractModelFromResponse } from "./utils/responseProcessor.ts";
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
  userId: string,
  category: string = 'jailbreaking'
) {
  // Get base provider for API calls
  const [baseProvider] = provider ? provider.split('-') : [null];
  
  console.log('Processing scan with provider:', baseProvider);

  const results = [];
  let processedCount = 0;
  const totalPrompts = prompts.length;
  
  for (const prompt of prompts) {
    try {
      console.log('Processing prompt:', prompt);
      
      // Get response from provider
      const response = await getProviderResponse(prompt, baseProvider, null, customEndpoint, apiKeys);
      console.log('Raw provider response:', response);
      
      // Extract readable response and model info
      const modelResponse = processProviderResponse(response, baseProvider || 'custom');
      const modelName = extractModelFromResponse(response, baseProvider || 'custom');
      console.log('Processed response:', modelResponse);
      console.log('Extracted model:', modelName);

      // Store result with category and extracted model name
      const { error: resultError } = await supabase
        .from('llm_scan_results')
        .insert({
          scan_id: scanId,
          user_id: userId,
          prompt,
          model_response: modelResponse,
          raw_response: response,
          provider: baseProvider || 'custom',
          model: modelName,
          category
        })
        .single();

      if (resultError) {
        console.error('Error storing result:', resultError);
        throw new Error(`Database error: ${resultError.message}`);
      }

      const result = {
        prompt,
        model_response: modelResponse,
        raw_response: response,
        model: modelName
      };
      
      results.push(result);
      
      // Update progress
      processedCount++;
      const progress = Math.round((processedCount / totalPrompts) * 100);
      
      // Update scan status with progress and model
      await supabase
        .from('llm_scans')
        .update({
          status: 'processing',
          results: {
            progress,
            responses: results,
            model: modelName
          }
        })
        .eq('id', scanId);

    } catch (error) {
      console.error('Error processing prompt:', error);
      results.push({
        prompt,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        model: 'Unknown Model'
      });
    }
  }

  // Update final scan status
  await supabase
    .from('llm_scans')
    .update({
      status: 'completed',
      results: {
        responses: results,
        progress: 100,
        model: results[0]?.model || 'Unknown Model'
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
  // Handle standard providers
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
      // Only use customEndpoint if no standard provider is specified
      if (customEndpoint) {
        return await handleCustomEndpoint(prompt, customEndpoint);
      }
      throw new Error(`Unsupported provider: ${provider}`);
  }
}