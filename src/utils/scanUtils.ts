export const getScanType = (results: { prompt: string; model_response: string } | null): string => {
  if (!results?.prompt) return "Manual Scan";
  
  // Check if the prompt contains newlines or commas, which would indicate it came from a CSV
  const hasMultipleLines = results.prompt.includes('\n') || results.prompt.includes(',');
  return hasMultipleLines ? "Batch Scan" : "Manual Scan";
};

export const formatScanResponse = (response: any) => {
  if (!response) return null;
  
  // Handle different response formats
  if (typeof response === 'string') {
    return {
      model_response: response,
      prompt: ''
    };
  }
  
  if (response.results && Array.isArray(response.results)) {
    return {
      model_response: response.results.map((r: any) => r.response || r.model_response || '').join('\n'),
      prompt: response.results.map((r: any) => r.prompt || '').join('\n')
    };
  }
  
  if (response.model_response || response.response) {
    return {
      model_response: response.model_response || response.response || '',
      prompt: response.prompt || ''
    };
  }
  
  return null;
};