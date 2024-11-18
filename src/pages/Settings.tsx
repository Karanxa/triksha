import { ApiKeyForm } from "@/components/settings/ApiKeyForm";

const Settings = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">API Keys</h1>
      <p className="text-muted-foreground mb-8">Configure your API keys for different LLM providers to enable scanning capabilities.</p>
      <ApiKeyForm />
    </div>
  );
};

export default Settings;