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
  qps: number,
  processPrompt: (prompt: string) => Promise<any>,
  options: ProcessBatchOptions
): Promise<any[]> {
  const { scanId, supabase } = options;
  const results: any[] = [];
  const totalPrompts = prompts.length;
  let processedCount = 0;
  let failedCount = 0;
  
  // Process prompts in batches based on QPS
  const batchSize = Math.min(qps, totalPrompts);
  console.log(`Processing with QPS: ${qps}, batch size: ${batchSize}`);
  
  const updateProgress = async (progress: number, failed: number) => {
    await supabase
      .from('llm_scans')
      .update({ 
        results: { 
          progress,
          total: totalPrompts,
          processed: processedCount,
          failed: failed,
          status: progress === 100 ? 'completed' : 'processing'
        },
        status: progress === 100 ? 'completed' : 'processing'
      })
      .eq('id', scanId);
  };

  try {
    // Process prompts in batches
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, Math.min(i + batchSize, prompts.length));
      console.log(`Processing batch ${i / batchSize + 1}, size: ${batch.length}`);

      // Process batch concurrently
      const batchResults = await Promise.all(
        batch.map(async (prompt) => {
          try {
            const result = await processPrompt(prompt);
            processedCount++;
            return result;
          } catch (error) {
            console.error(`Error processing prompt: ${prompt}`, error);
            failedCount++;
            processedCount++;
            return {
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              prompt,
              status: 'failed'
            };
          }
        })
      );

      results.push(...batchResults);
      
      const progress = Math.floor((processedCount / totalPrompts) * 100);
      await updateProgress(progress, failedCount);

      // If this isn't the last batch, wait for 1 second before processing the next batch
      // This helps prevent rate limiting while maintaining desired QPS
      if (i + batchSize < prompts.length) {
        console.log('Waiting 1 second before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Final update with complete results
    await updateProgress(100, failedCount);
    return results;

  } catch (error) {
    console.error('Batch processing error:', error);
    // Update scan status to failed
    await supabase
      .from('llm_scans')
      .update({ 
        status: 'failed',
        results: {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          processed: processedCount,
          failed: failedCount,
          total: totalPrompts
        }
      })
      .eq('id', scanId);
    
    throw error;
  }
}