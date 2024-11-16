export const getScanType = (results: { prompt: string; model_response: string } | null): string => {
  if (!results?.prompt) return "Manual Scan";
  
  // Check if the prompt contains newlines or commas, which would indicate it came from a CSV
  const hasMultipleLines = results.prompt.includes('\n') || results.prompt.includes(',');
  return hasMultipleLines ? "Batch Scan" : "Manual Scan";
};

export const formatScanResponse = (response: any) => {
  if (!response) return null;
  
  // Handle string responses
  if (typeof response === 'string') {
    try {
      response = JSON.parse(response);
    } catch {
      return {
        model_response: response,
        prompt: ''
      };
    }
  }
  
  // Handle array responses (batch results)
  if (Array.isArray(response)) {
    return response.map(r => ({
      model_response: r.model_response || r.response || '',
      prompt: r.prompt || ''
    }));
  }
  
  // Handle object responses
  if (typeof response === 'object') {
    // Handle results array within object
    if (response.results && Array.isArray(response.results)) {
      return response.results.map((r: any) => ({
        model_response: r.model_response || r.response || '',
        prompt: r.prompt || ''
      }));
    }
    
    // Handle single result object
    return {
      model_response: response.model_response || response.response || '',
      prompt: response.prompt || ''
    };
  }
  
  return null;
};