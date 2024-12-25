import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AIProviderSettings {
  provider: string;
  model: string;
  customEndpoint?: {
    url: string;
    apiKey: string;
    headers: string;
    method: string;
  } | null;
}

export const useAIProviderSettings = () => {
  const [settings, setSettings] = useState<AIProviderSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('ai_provider_settings')
        .single();

      if (error) throw error;
      setSettings(data?.ai_provider_settings || {
        provider: 'openai',
        model: 'gpt-4o-mini',
        customEndpoint: null
      });
    } catch (error) {
      console.error('Error loading AI provider settings:', error);
      toast.error('Failed to load AI provider settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: AIProviderSettings) => {
    try {
      const { error } = await supabase
        .from('integration_settings')
        .upsert({
          ai_provider_settings: newSettings,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      setSettings(newSettings);
      toast.success('AI provider settings updated');
    } catch (error) {
      console.error('Error updating AI provider settings:', error);
      toast.error('Failed to update AI provider settings');
    }
  };

  return { settings, isLoading, updateSettings };
};