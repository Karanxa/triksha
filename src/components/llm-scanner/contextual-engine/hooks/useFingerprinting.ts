import { FingerPrintResult } from "../types";

export const processFingerprinting = (messages: any[]): FingerPrintResult => {
  // Extract fingerprint results from messages
  const results: FingerPrintResult = {
    capabilities: '',
    boundaries: '',
    training: '',
    languages: '',
    safety: ''
  };

  // Process each message pair (question and answer)
  for (let i = 1; i < messages.length; i += 2) {
    const question = messages[i].content.toLowerCase();
    const answer = messages[i + 1]?.content || '';

    if (question.includes('capabilities')) {
      results.capabilities = answer;
    } else if (question.includes('ethical') || question.includes('boundaries')) {
      results.boundaries = answer;
    } else if (question.includes('training')) {
      results.training = answer;
    } else if (question.includes('languages')) {
      results.languages = answer;
    } else if (question.includes('harmful') || question.includes('safety')) {
      results.safety = answer;
    }
  }

  return results;
};