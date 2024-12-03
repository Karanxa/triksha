import { Button } from "@/components/ui/button";
import { ApiKeyCard } from "./ApiKeyCard";
import { LoadingState } from "./LoadingState";
import { useApiKeys } from "./useApiKeys";

export const ApiKeyForm = () => {
  const { keys, loading, saving, handleSubmit, handleChange } = useApiKeys();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <ApiKeyCard
          title="OpenAI"
          description="Configure your OpenAI API key for GPT models"
          value={keys.openai}
          onChange={(value) => handleChange('openai', value)}
          placeholder="sk-..."
        />

        <ApiKeyCard
          title="Anthropic"
          description="Configure your Anthropic API key for Claude models"
          value={keys.anthropic}
          onChange={(value) => handleChange('anthropic', value)}
          placeholder="sk-ant-..."
        />

        <ApiKeyCard
          title="Google AI (Gemini)"
          description="Configure your Google AI API key for Gemini models"
          value={keys.gemini}
          onChange={(value) => handleChange('gemini', value)}
          placeholder="AIza..."
        />

        <ApiKeyCard
          title="Hugging Face"
          description="Configure your Hugging Face API key"
          value={keys.huggingface}
          onChange={(value) => handleChange('huggingface', value)}
          placeholder="hf_..."
        />

        <ApiKeyCard
          title="GitHub"
          description="Configure your GitHub API key for code scanning"
          value={keys.github}
          onChange={(value) => handleChange('github', value)}
          placeholder="ghp_..."
        />

        <ApiKeyCard
          title="Ollama Endpoint"
          description="Configure your Ollama endpoint URL"
          value={keys.ollama_endpoint}
          onChange={(value) => handleChange('ollama_endpoint', value)}
          placeholder="http://localhost:11434"
        />

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saving..." : "Save API Keys"}
        </Button>
      </div>
    </form>
  );
};