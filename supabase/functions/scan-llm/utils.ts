export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const rateLimit = async (qps: number) => {
  const delayMs = 1000 / qps; // Convert QPS to milliseconds between requests
  await sleep(delayMs);
};
