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
  
  // Calculate delay between requests based on QPS
  const delayMs = Math.ceil(1000 / qps); // Convert QPS to milliseconds between requests
  console.log(`Processing with QPS: ${qps}, delay between requests: ${delayMs}ms`);
  
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
    // Process prompts with rate limiting
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      console.log(`Processing prompt ${i + 1}/${prompts.length}`);
      
      try {
        const result = await processPrompt(prompt);
        results.push(result);
        processedCount++;
      } catch (error) {
        console.error(`Error processing prompt: ${prompt}`, error);
        failedCount++;
        processedCount++;
        results.push({
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          prompt,
          status: 'failed'
        });
      }

      const progress = Math.floor((processedCount / totalPrompts) * 100);
      await updateProgress(progress, failedCount);

      // Apply rate limiting delay if not the last prompt
      if (i < prompts.length - 1) {
        console.log(`Waiting ${delayMs}ms before next request (QPS: ${qps})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
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