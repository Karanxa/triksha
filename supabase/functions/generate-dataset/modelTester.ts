interface TestResult {
  prompt: string;
  response: string;
  error?: string;
}

export async function testPromptsWithModel(
  prompts: string[],
  provider: string,
  model: string,
  apiKey: string
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const prompt of prompts) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${await response.text()}`);
      }

      const data = await response.json();
      results.push({
        prompt,
        response: data.choices[0].message.content
      });

      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error('Error testing prompt:', error);
      results.push({
        prompt,
        response: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}