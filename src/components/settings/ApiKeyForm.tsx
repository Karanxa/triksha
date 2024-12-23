import { Button } from "@/components/ui/button";
import { ApiKeyCard } from "./ApiKeyCard";
import { LoadingState } from "./LoadingState";
import { useApiKeys } from "./useApiKeys";
import { useEffect } from "react";
import { toast } from "sonner";

export const ApiKeyForm = () => {
  const { apiKeys, isLoading, isSaving, loadApiKeys, handleSubmit, handleChange } = useApiKeys();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    try {
      await handleSubmit(e);
      toast.success("API keys saved successfully");
    } catch (error) {
      console.error("Error saving API keys:", error);
      toast.error("Failed to save API keys");
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <ApiKeyCard
          title="OpenAI"
          description="Configure your OpenAI API key for GPT models"
          value={apiKeys.openai || ''}
          onChange={(value) => handleChange('openai', value)}
          placeholder="sk-..."
        />

        <ApiKeyCard
          title="Anthropic"
          description="Configure your Anthropic API key for Claude models"
          value={apiKeys.anthropic || ''}
          onChange={(value) => handleChange('anthropic', value)}
          placeholder="sk-ant-..."
        />

        <ApiKeyCard
          title="Google AI (Gemini)"
          description="Configure your Google AI API key for Gemini models"
          value={apiKeys.gemini || ''}
          onChange={(value) => handleChange('gemini', value)}
          placeholder="AIza..."
        />

        <ApiKeyCard
          title="Hugging Face"
          description="Configure your Hugging Face API key"
          value={apiKeys.huggingface || ''}
          onChange={(value) => handleChange('huggingface', value)}
          placeholder="hf_..."
        />

        <ApiKeyCard
          title="GitHub"
          description="Configure your GitHub API key for code scanning"
          value={apiKeys.github || ''}
          onChange={(value) => handleChange('github', value)}
          placeholder="ghp_..."
        />

        <ApiKeyCard
          title="Ollama Endpoint"
          description="Configure your custom Ollama endpoint URL"
          value={apiKeys.ollama_endpoint || ''}
          onChange={(value) => handleChange('ollama_endpoint', value)}
          placeholder="http://localhost:11434"
        />

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save API Keys"}
        </Button>
      </div>
    </form>
  );
};