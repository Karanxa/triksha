import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { processProviderResponse, extractModelFromResponse } from "./utils/responseProcessor.ts";
import { handleOpenAIRequest } from "./providers/openai.ts";
import { handleAnthropicRequest } from "./providers/anthropic.ts";
import { handleGeminiRequest } from "./providers/gemini.ts";
import { handleOllamaRequest } from "./providers/ollama.ts";
import { handleCustomEndpoint } from "./customEndpoint.ts";
import { augmentPrompt } from "./utils/promptAugmentation.ts";

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
  const [baseProvider] = provider ? provider.split('-') : [null];
  
  console.log('Processing scan with provider:', baseProvider);
  console.log('Initial prompts received:', prompts?.length || 0);

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

  const results = [];
  let processedCount = 0;
  const totalPrompts = validPrompts.length;

  await supabase
    .from('llm_scans')
    .update({
      status: 'processing',
      results: {
        progress: 0,
        total: totalPrompts,
        processed: 0
      }
    })
    .eq('id', scanId);

  for (const prompt of validPrompts) {
    try {
      console.log('Processing prompt:', prompt);
      
      // Get response from provider
      const response = await getProviderResponse(prompt, baseProvider, null, customEndpoint, apiKeys);
      console.log('Raw provider response received');
      
      // Extract readable response and model info
      const modelResponse = processProviderResponse(response, baseProvider || 'custom');
      const modelName = extractModelFromResponse(response, baseProvider || 'custom');
      console.log('Processed response for model:', modelName);

      // Analyze vulnerability
      console.log('Analyzing vulnerability for category:', category);
      const vulnerabilityAnalysis = await analyzeVulnerability(prompt, modelResponse, category);
      console.log('Vulnerability analysis result:', vulnerabilityAnalysis);

      // Store result with vulnerability analysis
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
          category,
          is_vulnerable: vulnerabilityAnalysis?.vulnerability_status === 'vulnerable',
          severity: vulnerabilityAnalysis?.severity || 'unknown',
          metadata: {
            vulnerability_analysis: vulnerabilityAnalysis
          }
        })
        .single();

      if (resultError) {
        console.error('Error storing result:', resultError);
        throw new Error(`Database error: ${resultError.message}`);
      }

      results.push({
        prompt,
        model_response: modelResponse,
        raw_response: response,
        model: modelName,
        is_vulnerable: vulnerabilityAnalysis?.vulnerability_status === 'vulnerable',
        severity: vulnerabilityAnalysis?.severity || 'unknown',
        analysis: vulnerabilityAnalysis
      });
      
      processedCount++;
      const progress = Math.round((processedCount / totalPrompts) * 100);
      
      await supabase
        .from('llm_scans')
        .update({
          status: 'processing',
          results: {
            progress,
            responses: results,
            model: modelName,
            total: totalPrompts,
            processed: processedCount
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
        total: totalPrompts,
        processed: processedCount,
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

async function analyzeVulnerability(prompt: string, response: string, category: string) {
  try {
    const result = await fetch('https://irdlyshhtwzqjvymilww.functions.supabase.co/analyze-vulnerability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({ prompt, response, category }),
    });

    if (!result.ok) {
      throw new Error(`Analysis failed: ${await result.text()}`);
    }

    return await result.json();
  } catch (error) {
    console.error('Error analyzing vulnerability:', error);
    return null;
  }
}