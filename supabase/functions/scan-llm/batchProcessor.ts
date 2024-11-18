interface ProcessBatchOptions {
  scanId: string;
  supabase: any;
  user: any;
  baseProvider: string | null;
  model: string | null;
  category: string;
}

export async function processBatchWithProgress(
  prompts: string[],
  batchSize: number,
  processPrompt: (prompt: string) => Promise<any>,
  options: ProcessBatchOptions
): Promise<any[]> {
  const { scanId, supabase, user, baseProvider, model, category } = options;
  const results: any[] = [];
  const totalBatches = Math.ceil(prompts.length / batchSize);
  const CHUNK_SIZE = 1000; // Number of results to store at once
  let resultsBuffer: any[] = [];
  
  const updateProgress = async (progress: number) => {
    await supabase
      .from('llm_scans')
      .update({ 
        results: { progress },
        status: 'processing'
      })
      .eq('id', scanId);
  };

  try {
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${currentBatch}/${totalBatches} (${batch.length} prompts)`);
      
      const batchPromises = batch.map(async (prompt) => {
        try {
          const response = await processPrompt(prompt);
          const modelResponse = typeof response === 'string' ? response : JSON.stringify(response);
          
          // Store individual result
          const { data: resultData, error: resultError } = await supabase
            .from('llm_scan_results')
            .insert({
              scan_id: scanId,
              user_id: user.id,
              prompt,
              model_response: modelResponse,
              raw_response: response,
              provider: baseProvider || 'custom',
              model: model || 'custom-endpoint',
              category,
            })
            .select()
            .single();

          if (resultError) throw resultError;
          return resultData;
        } catch (error) {
          console.error(`Error processing prompt "${prompt}":`, error);
          // Store error result
          const { data: errorResult } = await supabase
            .from('llm_scan_results')
            .insert({
              scan_id: scanId,
              user_id: user.id,
              prompt,
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              provider: baseProvider || 'custom',
              model: model || 'custom-endpoint',
              category,
            })
            .select()
            .single();
          
          return errorResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      resultsBuffer.push(...batchResults);

      // Store results in chunks to avoid memory issues
      if (resultsBuffer.length >= CHUNK_SIZE) {
        results.push(...resultsBuffer);
        resultsBuffer = [];
      }

      // Update progress
      const progress = Math.floor((currentBatch / totalBatches) * 100);
      await updateProgress(progress);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Store any remaining results
    if (resultsBuffer.length > 0) {
      results.push(...resultsBuffer);
    }

    return results;
  } catch (error) {
    console.error('Batch processing error:', error);
    throw error;
  }
}