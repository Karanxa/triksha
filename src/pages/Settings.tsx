import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import type { ApiKeys } from "@/integrations/supabase/types";

const Settings = () => {
  const session = useSession();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: "",
    huggingface: "",
    anthropic: "",
    gemini: ""
  });

  useEffect(() => {
    const fetchApiKeys = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('api_keys')
        .eq('id', session.user.id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch API keys. Please try again.",
        });
        return;
      }

      if (data?.api_keys) {
        setApiKeys(data.api_keys as ApiKeys);
      }
    };

    fetchApiKeys();
  }, [session?.user?.id, toast]);

  const handleSaveKeys = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          api_keys: apiKeys
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "API keys have been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save API keys. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">API Keys</h2>
            <p className="text-muted-foreground">
              Add your API keys for various AI services. These keys are encrypted and stored securely.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="openai">OpenAI API Key</Label>
              <Input
                id="openai"
                type="password"
                value={apiKeys.openai || ""}
                onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                placeholder="sk-..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="huggingface">Hugging Face API Key</Label>
              <Input
                id="huggingface"
                type="password"
                value={apiKeys.huggingface || ""}
                onChange={(e) => setApiKeys(prev => ({ ...prev, huggingface: e.target.value }))}
                placeholder="hf_..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anthropic">Anthropic API Key</Label>
              <Input
                id="anthropic"
                type="password"
                value={apiKeys.anthropic || ""}
                onChange={(e) => setApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                placeholder="sk-ant-..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gemini">Google Gemini API Key</Label>
              <Input
                id="gemini"
                type="password"
                value={apiKeys.gemini || ""}
                onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                placeholder="AIza..."
              />
            </div>
          </div>

          <Button onClick={handleSaveKeys} className="w-full">
            Save API Keys
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;