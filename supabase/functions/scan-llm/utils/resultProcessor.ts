import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { analyzeVulnerability } from "./vulnerabilityAnalyzer.ts";

interface ScanResult {
  prompt: string;
  model_response: string;
  raw_response: any;
  model: string;
  is_vulnerable?: boolean;
  severity?: string;
  analysis?: any;
}

export async function processAndStoreScanResult(
  supabase: any,
  scanId: string,
  userId: string,
  prompt: string,
  modelResponse: string,
  rawResponse: any,
  provider: string,
  modelName: string,
  category: string
): Promise<ScanResult> {
  console.log('Analyzing vulnerability for category:', category);
  const vulnerabilityAnalysis = await analyzeVulnerability(modelResponse, category);
  console.log('Vulnerability analysis result:', vulnerabilityAnalysis);

  // Store result with vulnerability analysis
  const { error: resultError } = await supabase
    .from('llm_scan_results')
    .insert({
      scan_id: scanId,
      user_id: userId,
      prompt,
      model_response: modelResponse,
      raw_response: rawResponse,
      provider: provider || 'custom',
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

  return {
    prompt,
    model_response: modelResponse,
    raw_response: rawResponse,
    model: modelName,
    is_vulnerable: vulnerabilityAnalysis?.vulnerability_status === 'vulnerable',
    severity: vulnerabilityAnalysis?.severity || 'unknown',
    analysis: vulnerabilityAnalysis
  };
}