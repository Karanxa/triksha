/**
 * Process items in batches with controlled concurrency
 */
export async function processBatchesWithConcurrency<T, R>(
  items: T[],
  batchSize: number,
  processItem: (item: T) => Promise<R>,
  onProgress?: (progress: number) => void
): Promise<R[]> {
  const results: R[] = [];
  const totalItems = items.length;
  let processedItems = 0;

  // Process in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    // Process batch items concurrently
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const result = await processItem(item);
        processedItems++;
        
        if (onProgress) {
          onProgress((processedItems / totalItems) * 100);
        }
        
        return result;
      })
    );
    
    results.push(...batchResults);
  }

  return results;
}