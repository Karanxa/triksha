import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ApiKeys } from "@/integrations/supabase/types/common";
import { Skeleton } from "@/components/ui/skeleton";

export const ApiKeyForm = () => {
  const session = useSession();
  const [keys, setKeys] = useState<ApiKeys>({
    openai: "",
    anthropic: "",
    gemini: "",
    huggingface: "",
    github: "",
    ollama_endpoint: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('api_keys')
          .eq('id', session.user.id)
          .single();
          
        if (error) throw error;
        if (data?.api_keys) {
          setKeys(data.api_keys as ApiKeys);
        }
      } catch (error) {
        console.error('Error fetching API keys:', error);
        toast.error("Failed to load API keys");
      } finally {
        setLoading(false);
      }
    };

    fetchKeys();
  }, [session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ api_keys: keys })
        .eq('id', session.user.id);

      if (error) throw error;
      toast.success("API keys updated successfully");
    } catch (error) {
      console.error('Error updating API keys:', error);
      toast.error("Failed to update API keys");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof ApiKeys, value: string) => {
    setKeys(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>OpenAI</CardTitle>
            <CardDescription>Configure your OpenAI API key for GPT models</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              value={keys.openai}
              onChange={(e) => handleChange('openai', e.target.value)}
              placeholder="sk-..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anthropic</CardTitle>
            <CardDescription>Configure your Anthropic API key for Claude models</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              value={keys.anthropic}
              onChange={(e) => handleChange('anthropic', e.target.value)}
              placeholder="sk-ant-..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google AI (Gemini)</CardTitle>
            <CardDescription>Configure your Google AI API key for Gemini models</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              value={keys.gemini}
              onChange={(e) => handleChange('gemini', e.target.value)}
              placeholder="AIza..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hugging Face</CardTitle>
            <CardDescription>Configure your Hugging Face API key</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              value={keys.huggingface}
              onChange={(e) => handleChange('huggingface', e.target.value)}
              placeholder="hf_..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GitHub</CardTitle>
            <CardDescription>Configure your GitHub API key for code scanning</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              value={keys.github}
              onChange={(e) => handleChange('github', e.target.value)}
              placeholder="ghp_..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ollama Endpoint</CardTitle>
            <CardDescription>Configure your Ollama endpoint URL</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              value={keys.ollama_endpoint}
              onChange={(e) => handleChange('ollama_endpoint', e.target.value)}
              placeholder="http://localhost:11434"
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saving..." : "Save API Keys"}
        </Button>
      </div>
    </form>
  );
};