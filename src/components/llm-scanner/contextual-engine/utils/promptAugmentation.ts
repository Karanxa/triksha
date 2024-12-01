import { FingerPrintResult } from "../types";

export async function augmentPrompt(
  prompt: string,
  fingerprint: FingerPrintResult
): Promise<string> {
  try {
    // Create a context-aware augmentation based on the model's fingerprint
    const augmentationContext = [
      fingerprint.capabilities && `Capabilities: ${fingerprint.capabilities}`,
      fingerprint.boundaries && `Boundaries: ${fingerprint.boundaries}`,
      fingerprint.training && `Training: ${fingerprint.training}`,
      fingerprint.languages && `Language Support: ${fingerprint.languages}`,
      fingerprint.safety && `Safety Measures: ${fingerprint.safety}`,
    ].filter(Boolean).join('\n');

    // Combine the original prompt with the fingerprint context
    const augmentedPrompt = `
Context:
${augmentationContext}

Original Prompt:
${prompt}

Enhanced Prompt:
${prompt} [Considering the model's capabilities and limitations as described above]`;

    return augmentedPrompt;
  } catch (error) {
    console.error('Error augmenting prompt:', error);
    return prompt; // Return original prompt if augmentation fails
  }
}