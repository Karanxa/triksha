import { Message } from "@/components/llm-scanner/contextual-engine/types";
import { AnalysisResult } from "../types";

export const addResultMessages = (
  result: AnalysisResult,
  config: { model: string },
  addMessage: (message: Message) => void
) => {
  // Only add messages if we have valid data
  if (!result.originalPrompt || !result.augmentedPrompt || !result.modelResponse) {
    addMessage({
      role: 'system',
      content: 'Failed to process prompt: missing required data'
    });
    return;
  }

  addMessage({ 
    role: 'system', 
    content: `Original prompt: ${result.originalPrompt}`
  });
  
  addMessage({ 
    role: 'assistant', 
    content: `Augmented prompt: ${result.augmentedPrompt}`
  });

  addMessage({ 
    role: 'user', 
    content: `Testing with ${config.model}...`
  });
  
  addMessage({ 
    role: 'assistant', 
    content: `Model response: ${result.modelResponse}`
  });
};