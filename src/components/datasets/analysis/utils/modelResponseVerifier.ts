import { AnalysisResult } from "../types";

export const verifyModelResponse = (response: any): boolean => {
  if (!response || typeof response !== 'object') {
    console.error('Invalid response format:', response);
    return false;
  }

  // Verify we have the expected response structure
  if (!response.results || !Array.isArray(response.results)) {
    console.error('Missing or invalid results array:', response);
    return false;
  }

  // Verify each result has required fields
  const hasValidResults = response.results.every((result: AnalysisResult) => {
    const isValid = result.originalPrompt && 
                   result.augmentedPrompt && 
                   result.modelResponse;
    
    if (!isValid) {
      console.error('Invalid result structure:', result);
    }
    return isValid;
  });

  return hasValidResults;
};