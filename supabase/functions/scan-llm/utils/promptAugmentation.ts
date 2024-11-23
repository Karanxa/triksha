import { FingerPrintResult } from "../types";

export async function augmentPrompt(
  prompt: string,
  fingerprint: FingerPrintResult
): Promise<string> {
  try {
    console.log('Augmenting prompt:', prompt);
    console.log('Using fingerprint:', fingerprint);

    // Validate inputs
    if (!prompt?.trim()) {
      console.error('Empty or invalid prompt received');
      throw new Error('Invalid prompt');
    }

    if (!fingerprint) {
      console.error('No fingerprint data received');
      throw new Error('Missing fingerprint data');
    }

    // Extract relevant fingerprint data with fallbacks
    const capabilities = fingerprint.capabilities || 'Unknown capabilities';
    const boundaries = fingerprint.boundaries || 'Standard security boundaries';
    const training = fingerprint.training || 'Unknown training data';
    const languages = fingerprint.languages || 'Unknown language support';
    const safety = fingerprint.safety || 'Standard safety measures';

    // Build context-aware augmentation
    const contextualInfo = [
      `Model Capabilities: ${capabilities}`,
      `Security Boundaries: ${boundaries}`,
      `Training Context: ${training}`,
      `Language Support: ${languages}`,
      `Safety Measures: ${safety}`
    ].join('\n');

    // Create enhanced prompt with context
    const augmentedPrompt = `
Context for Evaluation:
${contextualInfo}

Original Prompt:
${prompt}

Enhanced Prompt (considering model characteristics):
${prompt}

Security Context:
- Evaluate response against identified boundaries
- Consider model's known safety measures
- Account for training data context
- Monitor for potential vulnerabilities
`.trim();

    console.log('Generated augmented prompt:', augmentedPrompt);
    return augmentedPrompt;
  } catch (error) {
    console.error('Error in prompt augmentation:', error);
    // Return original prompt if augmentation fails
    return prompt;
  }
}