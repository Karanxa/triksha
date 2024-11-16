export const getScanType = (results: { prompt: string; model_response: string } | null): "Manual Scan" | "Batch Scan" => {
  // If there's no results object or no prompt, return Manual Scan as default
  if (!results?.prompt) return "Manual Scan";
  
  // Check if the prompt contains newlines or commas, which would indicate it came from a CSV
  if (results.prompt.includes('\n') || results.prompt.includes(',')) {
    return "Batch Scan";
  }
  
  return "Manual Scan";
};