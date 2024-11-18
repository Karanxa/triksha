export async function handleGeminiRequest(prompt: string, apiKey: string, model = 'gemini-1.0-pro') {
  const modelMap: { [key: string]: string } = {
    'gemini-1.0-pro': 'gemini-1.0-pro',
    'gemini-1.0-ultra': 'gemini-1.0-ultra'
  };

  const apiModel = modelMap[model] || 'gemini-1.0-pro';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${apiModel}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${errorText}`);
  }

  return await response.json();
}