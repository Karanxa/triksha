export const getScanType = (results: { prompt: string; model_response: string } | null): "Manual Scan" | "Batch Scan" => {
  // If there's no results object, return Manual Scan as default
  if (!results) return "Manual Scan";
  
  // Check if the prompt contains newlines or commas, which would indicate it came from a CSV
  const prompt = results.prompt;
  if (prompt.includes('\n') || prompt.includes(',')) {
    return "Batch Scan";
  }
  
  return "Manual Scan";
};