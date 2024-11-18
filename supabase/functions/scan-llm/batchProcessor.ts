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
    // Process prompts in batches
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(prompts.length / batchSize)}`);
      
      const batchPromises = batch.map(async (prompt) => {
        try {
          const result = await processPrompt(prompt);
          processedCount++;
          const progress = Math.floor((processedCount / totalPrompts) * 100);
          await updateProgress(progress);
          return result;
        } catch (error) {
          console.error(`Error processing prompt: ${prompt}`, error);
          processedCount++;
          const progress = Math.floor((processedCount / totalPrompts) * 100);
          await updateProgress(progress);
          throw error;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      // Filter and transform results
      const validResults = batchResults
        .map(result => result.status === 'fulfilled' ? result.value : null)
        .filter(Boolean);
      
      results.push(...validResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  } catch (error) {
    console.error('Batch processing error:', error);
    throw error;
  }
}