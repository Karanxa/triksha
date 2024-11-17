export async function processBatchWithProgress(
  prompts: string[],
  batchSize: number,
  processPrompt: (prompt: string) => Promise<any>
): Promise<any[]> {
  const results: any[] = [];
  const totalBatches = Math.ceil(prompts.length / batchSize);
  
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
    results.push(...batchResults);

    // Update scan progress in database
    await updateScanProgress(totalBatches, currentBatch);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

async function updateScanProgress(totalBatches: number, currentBatch: number) {
  const progress = Math.floor((currentBatch / totalBatches) * 100);
  console.log(`Scan progress: ${progress}%`);
  return progress;
}