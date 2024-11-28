import { supabase } from '@/integrations/supabase/client';
import { CustomEndpoint } from '../../types/CustomEndpoint';
import { Json } from '@/integrations/supabase/types/common';

interface ProcessDatasetAnalysisProps {
  datasetId: string;
  provider: string;
  model: string;
  fingerprint: any;
  customEndpoint?: CustomEndpoint;
  scanId: string | null;
  supabase: any;
}

export const processDatasetAnalysis = async ({
  datasetId,
  provider,
  model,
  fingerprint,
  customEndpoint,
  scanId,
  supabase
}: ProcessDatasetAnalysisProps) => {
  const { data, error } = await supabase.functions.invoke('process-geraide-scan', {
    body: {
      datasetId,
      provider,
      model,
      fingerprint,
      customEndpoint
    }
  });

  if (error) throw error;

  // Process each augmented prompt with the model
  const processedResults = [];
  for (const result of data.results) {
    try {
      const { data: modelResponse, error: modelError } = await supabase.functions.invoke('geraide-fingerprint', {
        body: {
          provider,
          model,
          prompt: result.augmentedPrompt,
          customEndpoint
        }
      });

      if (modelError) throw modelError;

      processedResults.push({
        originalPrompt: result.originalPrompt,
        augmentedPrompt: result.augmentedPrompt,
        modelResponse: modelResponse.response
      });

      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error processing prompt:', error);
      processedResults.push({
        originalPrompt: result.originalPrompt,
        augmentedPrompt: result.augmentedPrompt,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update scan with results if we have a scanId
  if (scanId) {
    const { error: updateError } = await supabase
      .from('geraide_scans')
      .update({
        fingerprint_results: fingerprint,
        dataset_analysis_results: processedResults,
        is_vulnerable: processedResults.some(r => r.modelResponse?.includes('vulnerable')),
      })
      .eq('id', scanId);

    if (updateError) throw updateError;
  }

  return processedResults;
};