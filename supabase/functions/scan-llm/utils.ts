export function processResponse(rawResponse: any): string {
  if (typeof rawResponse === 'string') return rawResponse;
  
  // OpenAI
  if (rawResponse.choices?.[0]?.message?.content) {
    return rawResponse.choices[0].message.content;
  }
  
  // Anthropic
  if (rawResponse.content?.[0]?.text) {
    return rawResponse.content[0].text;
  }
  
  // Gemini
  if (rawResponse.candidates?.[0]?.content?.parts?.[0]?.text) {
    return rawResponse.candidates[0].content.parts[0].text;
  }
  
  // Ollama
  if (rawResponse.response) {
    return rawResponse.response;
  }
  
  // Custom endpoint
  if (rawResponse.model_response) {
    return rawResponse.model_response;
  }
  
  // Fallback
  return JSON.stringify(rawResponse);
}

export async function analyzeVulnerability(prompt: string, response: string, category: string) {
  try {
    const result = await fetch('/functions/v1/analyze-vulnerability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, response, category }),
    });

    if (!result.ok) {
      throw new Error(`Analysis failed: ${await result.text()}`);
    }

    return await result.json();
  } catch (error) {
    console.error('Error analyzing vulnerability:', error);
    return null;
  }
}