import { createClient } from '@supabase/supabase-js';

export const queryModel = async (provider: string, model: string, apiKey: string, prompt: string): Promise<string> => {
  let endpoint, headers, body;

  switch (provider) {
    case 'openai':
      endpoint = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };
      body = {
        model: model === 'gpt-4o' ? 'gpt-4-0125-preview' : 'gpt-3.5-turbo-0125',
        messages: [{ role: 'user', content: prompt }]
      };
      break;

    case 'anthropic':
      endpoint = 'https://api.anthropic.com/v1/messages';
      headers = {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      };
      body = {
        model,
        messages: [{ role: 'user', content: prompt }]
      };
      break;

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API error: ${await response.text()}`);
  }

  const data = await response.json();
  return provider === 'openai' 
    ? data.choices[0].message.content
    : data.content[0].text;
};

export const getPromptsFromDataset = async (supabase: any, dataset: any): Promise<string[]> => {
  if (dataset.file_path) {
    const response = await supabase.storage
      .from('datasets')
      .download(dataset.file_path);

    if (!response.data) throw new Error('Failed to download dataset file');

    const text = await response.data.text();
    const lines = text.split('\n');
    const headers = lines[0].toLowerCase().split(',');
    const promptIndex = headers.findIndex(h => 
      h === 'prompt' || h === 'prompts' || h === 'text'
    );

    if (promptIndex === -1) throw new Error('No prompt column found in CSV');

    return lines
      .slice(1)
      .map(line => {
        const values = line.split(',');
        return values[promptIndex]?.trim() || '';
      })
      .filter(Boolean);
  }

  if (dataset.metadata?.prompts) {
    return dataset.metadata.prompts;
  }

  throw new Error('No prompts found in dataset');
};