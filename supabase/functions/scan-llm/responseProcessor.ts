export function processCustomEndpointResponse(response: any): string {
  console.log('Processing response:', response);
  
  // If there's an error, return it directly
  if (response?.error) {
    return JSON.stringify({ error: response.error });
  }
  
  // Try to extract the response content from common API response formats
  if (typeof response === 'string') {
    try {
      const parsed = JSON.parse(response);
      console.log('Parsed string response:', parsed);
      return processCustomEndpointResponse(parsed);
    } catch {
      return response;
    }
  }
  
  // Check for aegis response format
  if (response?.aegis_response?.evaluation_result) {
    console.log('Found Aegis response format');
    return JSON.stringify({
      evaluation: response.aegis_response.evaluation_result,
      llm_response: response.llm_response?.response || 'No LLM response available'
    });
  }
  
  // Check for LLM response
  if (response?.llm_response?.response) {
    console.log('Found LLM response format');
    return response.llm_response.response;
  }
  
  // Check for common response patterns
  if (response?.response) return response.response;
  if (response?.text) return response.text;
  if (response?.content) return response.content;
  if (response?.message) return response.message;
  if (response?.generated_text) return response.generated_text;
  if (response?.choices?.[0]?.text) return response.choices[0].text;
  if (response?.choices?.[0]?.message?.content) return response.choices[0].message.content;
  
  // If we can't find a standard format, return the stringified response
  console.log('No standard format found, returning stringified response');
  return JSON.stringify(response);
}