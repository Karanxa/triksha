import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { processProviderResponse, extractModelFromResponse } from "./utils/responseProcessor.ts";
import { handleOpenAIRequest } from "./providers/openai.ts";
import { handleAnthropicRequest } from "./providers/anthropic.ts";
import { handleGeminiRequest } from "./providers/gemini.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import { handleCustomEndpoint } from "./customEndpoint.ts";
import { processAndStoreScanResult } from "./utils/resultProcessor.ts";
import { processBatchWithProgress } from "./batchProcessor.ts";

export async function processScan(
  scanId: string,
  prompts: string[],
  provider: string | null,
  customEndpoint: any,
  apiKeys: any,
  supabase: any,
  userId: string,
  category: string = 'jailbreaking',
  qps: number = 5 // Default to 5 QPS if not specified
) {
  const [baseProvider] = provider ? provider.split('-') : [null];
  
  console.log('Processing scan with provider:', baseProvider);
  console.log('Initial prompts received:', prompts?.length || 0);
  console.log('Using QPS:', qps);

  if (!Array.isArray(prompts)) {
    console.error('Invalid prompts format:', typeof prompts);
    throw new Error('Prompts must be provided as an array');
  }

  const validPrompts = prompts
    .filter(prompt => prompt && typeof prompt === 'string')
    .map(prompt => prompt.trim())
    .filter(prompt => prompt.length > 0);

  console.log('Valid prompts after cleaning:', validPrompts.length);

  if (validPrompts.length === 0) {
    throw new Error('No valid prompts found after cleaning. Please check your input.');
  }

  // Process prompts using the batch processor with QPS control
  const results = await processBatchWithProgress(
    validPrompts,
    qps,
    async (prompt) => {
      try {
        console.log('Processing prompt:', prompt);
        
        // Get response from provider
        const response = await getProviderResponse(prompt, baseProvider, null, customEndpoint, apiKeys);
        console.log('Raw provider response received');
        
        // Extract readable response and model info
        const modelResponse = processProviderResponse(response, baseProvider || 'custom');
        const modelName = extractModelFromResponse(response, baseProvider || 'custom');
        console.log('Processed response for model:', modelName);

        // Process and store result
        return await processAndStoreScanResult(
          supabase,
          scanId,
          userId,
          prompt,
          modelResponse,
          response,
          baseProvider,
          modelName,
          category
        );
      } catch (error) {
        console.error('Error processing prompt:', error);
        throw error;
      }
    },
    { scanId, supabase, user: userId, baseProvider, model: null, category }
  );

  // Update final scan status with vulnerability summary
  const vulnerableCount = results.filter(r => r.is_vulnerable).length;
  const overallVulnerable = vulnerableCount > 0;
  
  await supabase
    .from('llm_scans')
    .update({
      status: 'completed',
      is_vulnerable: overallVulnerable,
      results: {
        responses: results,
        progress: 100,
        total: validPrompts.length,
        processed: results.length,
        model: results[0]?.model || 'Unknown Model',
        vulnerability_summary: {
          total_scans: results.length,
          vulnerable_count: vulnerableCount,
          is_vulnerable: overallVulnerable
        }
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
