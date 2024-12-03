interface FingerPrintResult {
  capabilities?: string;
  boundaries?: string;
  training?: string;
  languages?: string;
  safety?: string;
}

export async function augmentWithFingerprint(
  prompts: string[],
  fingerprint: FingerPrintResult
): Promise<string[]> {
  return prompts.map(prompt => {
    try {
      // Create context from fingerprint data
      const context = [
        fingerprint.capabilities && `Model capabilities: ${fingerprint.capabilities}`,
        fingerprint.boundaries && `Security boundaries: ${fingerprint.boundaries}`,
        fingerprint.safety && `Safety measures: ${fingerprint.safety}`,
        fingerprint.training && `Training context: ${fingerprint.training}`,
        fingerprint.languages && `Language support: ${fingerprint.languages}`
      ].filter(Boolean).join('\n');

      // Enhance the prompt with fingerprint context
      return `Given the following model characteristics:
${context}

Original prompt:
${prompt}

Enhanced prompt considering the model's specific characteristics:
${prompt}`;
    } catch (error) {
      console.error('Error augmenting prompt with fingerprint:', error);
      return prompt; // Return original prompt if augmentation fails
    }
  });
}