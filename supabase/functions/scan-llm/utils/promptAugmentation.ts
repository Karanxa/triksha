import { FingerPrintResult } from "../types.ts";

export async function augmentPrompt(
  prompt: string,
  fingerprint: FingerPrintResult
): Promise<string> {
  try {
    // Basic prompt validation - only check if it's a non-empty string
    if (typeof prompt !== 'string' || !prompt.trim()) {
      console.error('Invalid prompt:', prompt);
      return prompt; // Return original prompt instead of throwing
    }

    // Handle missing fingerprint more gracefully
    const fingerprintData = {
      capabilities: fingerprint?.capabilities || 'Standard LLM capabilities',
      boundaries: fingerprint?.boundaries || 'Default security boundaries',
      training: fingerprint?.training || 'Standard training context',
      languages: fingerprint?.languages || 'Multiple languages',
      safety: fingerprint?.safety || 'Default safety measures'
    };

    // Build a more concise context that won't overwhelm the model
    const contextualInfo = [
      `Model Info: ${fingerprintData.capabilities}`,
      `Security: ${fingerprintData.boundaries}`,
      `Safety: ${fingerprintData.safety}`
    ].join(' | ');

    // Create enhanced prompt with minimal wrapping
    const augmentedPrompt = `
Context: ${contextualInfo}

${prompt}

[Evaluate considering model characteristics and security boundaries]`.trim();

    console.log('Successfully augmented prompt:', {
      original: prompt,
      augmented: augmentedPrompt
    });

    return augmentedPrompt;
  } catch (error) {
    console.error('Error in prompt augmentation:', error);
    // Return original prompt if augmentation fails
    return prompt;
  }
}