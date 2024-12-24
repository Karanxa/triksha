import { FingerPrintResult } from "../types";

export const processRedTeaming = async (
  provider: string,
  model: string,
  fingerprint: FingerPrintResult
) => {
  try {
    const response = await fetch('/api/process-red-team', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        model,
        fingerprint,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process red teaming');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in red teaming:', error);
    throw error;
  }
};