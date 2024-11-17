interface ProcessBatchOptions {
  scanId: string;
  supabase: any;
}

export async function processBatchWithProgress(
  prompts: string[],
  batchSize: number,
  processPrompt: (prompt: string) => Promise<any>,
  options: ProcessBatchOptions
): Promise<any[]> {
  const { scanId, supabase } = options;
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

  const storeResults = async (results: any[]) => {
    if (results.length === 0) return;

    await supabase
      .from('llm_scan_results')
      .insert(
        results.map(result => ({
          scan_id: scanId,
          prompt: result.prompt,
          model_response: result.model_response,
          raw_response: result.raw_response,
          provider: result.provider,
          model: result.model,
          error: result.error,
          created_at: result.timestamp
        }))
      );
  };

  try {
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${currentBatch}/${totalBatches} (${batch.length} prompts)`);
      
      const batchPromises = batch.map(async (prompt) => {
        try {
          return await processPrompt(prompt);
        } catch (error) {
          console.error(`Error processing prompt: ${error.message}`);
          return {
            error: error.message,
            prompt
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      resultsBuffer.push(...batchResults);

      // Store results in chunks to avoid memory issues
      if (resultsBuffer.length >= CHUNK_SIZE) {
        await storeResults(resultsBuffer);
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
      await storeResults(resultsBuffer);
      results.push(...resultsBuffer);
    }

    return results;
  } catch (error) {
    console.error('Batch processing error:', error);
    throw error;
  }
}