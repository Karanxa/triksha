interface Model {
  value: string;
  label: string;
}

export const getModelsForProvider = (provider: string): Model[] => {
  switch (provider) {
    case "openai":
      return [
        { value: "gpt4o", label: "GPT-4 Optimized" },
        { value: "gpt4o-mini", label: "GPT-4 Mini" }
      ];
    case "anthropic":
      return [
        { value: "claude3", label: "Claude 3" },
        { value: "claude2", label: "Claude 2" }
      ];
    case "google":
      return [
        { value: "gemini-pro", label: "Gemini Pro" },
        { value: "gemini-ultra", label: "Gemini Ultra" }
      ];
    case "ollama":
      return [
        { value: "llama2", label: "Llama 2" },
        { value: "mistral", label: "Mistral" },
        { value: "codellama", label: "Code Llama" }
      ];
    default:
      return [];
  }
};