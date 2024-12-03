import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ApiKeys } from "@/integrations/supabase/types/common";

export const useApiKeys = () => {
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
          setKeys({
            openai: data.api_keys.openai || "",
            anthropic: data.api_keys.anthropic || "",
            gemini: data.api_keys.gemini || "",
            huggingface: data.api_keys.huggingface || "",
            github: data.api_keys.github || "",
            ollama_endpoint: data.api_keys.ollama_endpoint || ""
          });
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
      const apiKeys = {
        openai: keys.openai || "",
        anthropic: keys.anthropic || "",
        gemini: keys.gemini || "",
        huggingface: keys.huggingface || "",
        github: keys.github || "",
        ollama_endpoint: keys.ollama_endpoint || ""
      };

      const { error } = await supabase
        .from('profiles')
        .update({ api_keys: apiKeys })
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

  return { keys, loading, saving, handleSubmit, handleChange };
};