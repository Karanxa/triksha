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
  const { scanId, supabase } = options;
  const results: any[] = [];
  const totalPrompts = prompts.length;
  let processedCount = 0;
  let failedCount = 0;
  
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
      const batch = prompts.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(prompts.length / batchSize)}`);
      
      const batchPromises = batch.map(async (prompt) => {
        try {
          const result = await processPrompt(prompt);
          processedCount++;
          const progress = Math.floor((processedCount / totalPrompts) * 100);
          await updateProgress(progress, failedCount);
          return result;
        } catch (error) {
          console.error(`Error processing prompt: ${prompt}`, error);
          failedCount++;
          processedCount++;
          const progress = Math.floor((processedCount / totalPrompts) * 100);
          await updateProgress(progress, failedCount);
          
          // Return error result to be stored
          return {
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            prompt,
            status: 'failed'
          };
        }
      });

      // Wait for all promises in the batch to settle
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process results, including both successful and failed ones
      const processedResults = batchResults.map(result => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          failedCount++;
          return {
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error occurred',
            status: 'failed'
          };
        }
      });
      
      results.push(...processedResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < prompts.length) {
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