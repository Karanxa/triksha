export function processProviderResponse(response: any, provider: string): string {
  if (!response) return 'No response received';
  
  switch (provider) {
    case 'openai':
      return response.choices?.[0]?.message?.content || JSON.stringify(response);
    case 'anthropic':
      return response.content?.[0]?.text || JSON.stringify(response);
    case 'gemini':
      return response.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(response);
    case 'ollama':
      return response.response || JSON.stringify(response);
    default:
      return typeof response === 'string' ? response : JSON.stringify(response);
  }
}

export function extractModelFromResponse(response: any, provider: string): string {
  if (!response) return 'Unknown Model';
  
  switch (provider) {
    case 'openai':
      return response.model || 'Unknown OpenAI Model';
    case 'anthropic':
      return response.model || 'Unknown Anthropic Model';
    case 'gemini':
      return response.model || 'Unknown Gemini Model';
    case 'ollama':
      return response.model || 'Unknown Ollama Model';
    default:
      return 'Unknown Model';
  }
}